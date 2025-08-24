import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { EnhancedTable } from '../EnhancedTable';
import { Modal } from 'antd';
import { vi } from 'vitest';
import { describe, test, expect } from 'vitest';

const columns = [
  { key: 'id', title: 'ID', dataIndex: 'id' },
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'price', title: 'Price', dataIndex: 'price' }
];

const data = [
  { id: '1', name: 'Apple', price: 10 },
  { id: '2', name: 'Banana', price: 5 },
  { id: '3', name: 'Cherry', price: 20 }
];

describe('EnhancedTable', () => {
  test('renders table and filters by search', async () => {
    render(<EnhancedTable columns={columns} dataSource={data} showColumnConfig={false} />);

    // Table rows rendered
    expect(await screen.findByText('Apple')).toBeInTheDocument();

    // Type into search
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'Banana' } });

    // Only Banana should be visible
    expect(screen.queryByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).toBeNull();
  });

  test('column config apply hides a column', async () => {
    render(<EnhancedTable columns={columns} dataSource={data} showColumnConfig={true} />);

  // Open config modal by clicking the settings action button (icon text 'settings')
  const settingsButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('settings'));
  expect(settingsButton).toBeTruthy();
  fireEvent.click(settingsButton);

  // Wait for the config modal to appear and scope queries within it
  const dialog = await screen.findByRole('dialog');
  const modal = within(dialog);

  // Find the Price checkbox inside the modal and uncheck it
  const priceCheckbox = modal.getByLabelText('Price');
  fireEvent.click(priceCheckbox);

  // Click Apply Changes inside the modal
  const applyBtn = modal.getByText('Apply Changes');
  fireEvent.click(applyBtn);

  // Wait for modal to close
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

  // Price column header should no longer be visible (query columnheader specifically)
  expect(screen.queryByRole('columnheader', { name: 'Price' })).toBeNull();
  });

  test('row selection updates selected count', async () => {
    render(<EnhancedTable columns={columns} dataSource={data} rowSelection={{}} onDelete={() => {}} />);

    // Ensure a row is present
    const appleCell = await screen.findByText('Apple');
    const row = appleCell.closest('tr');
    const checkbox = within(row).getByRole('checkbox');

    // Select the row
    fireEvent.click(checkbox);

    // Delete Selected indicator should show (even if button is disabled)
    expect(screen.getByText(/Delete Selected \(1\)/)).toBeInTheDocument();
  });

  test('onDelete is called when delete confirmed', async () => {
    const onDelete = vi.fn();

    // Mock Modal.confirm so that when called we immediately invoke onOk
    const originalConfirm = Modal.confirm;
    Modal.confirm = (opts) => {
      opts.onOk && opts.onOk();
      return {};
    };

    render(<EnhancedTable columns={columns} dataSource={data} rowSelection={{}} onDelete={onDelete} />);

  // Select first row by finding all row checkboxes and clicking the first
  const allRowCheckboxes = await screen.findAllByRole('checkbox');
  // The first few checkboxes may be header/controls; pick the last checkbox which corresponds to the first data row
  const rowCheckbox = allRowCheckboxes[allRowCheckboxes.length - 1];
  fireEvent.click(rowCheckbox);

  // Click the Delete Selected button (wrapped in Popconfirm)
  const deleteBtn = await screen.findByText(/Delete Selected \(1\)/);
  fireEvent.click(deleteBtn);

  // Popconfirm should show a confirm button with text 'Delete' — click it
  const confirmBtn = await screen.findByText('Delete');
  fireEvent.click(confirmBtn);

  // onDelete should have been called once
  expect(onDelete).toHaveBeenCalledTimes(1);

    // restore Modal.confirm
    Modal.confirm = originalConfirm;
  });

  test('sorting by Price toggles order', async () => {
    // Render with default sort ascending on price (Banana should be first)
    const { unmount } = render(
      <EnhancedTable key="asc" columns={columns} dataSource={data} defaultSortField="price" defaultSortOrder="ascend" />
    );

    // Banana has price 5 so should appear first when sorted ascending
    expect(await screen.findByText('Banana')).toBeInTheDocument();

    // Re-render with descending order (force remount with different key)
    unmount();
    render(
      <EnhancedTable key="desc" columns={columns} dataSource={data} defaultSortField="price" defaultSortOrder="descend" />
    );

    // Cherry has price 20 and should appear first when sorted descending
    expect(await screen.findByText('Cherry')).toBeInTheDocument();
  });

  test('column filter for Price filters rows', async () => {
  const { container: _container2 } = render(<EnhancedTable columns={columns} dataSource={data} />);

    // Open Price column filter by clicking its filter trigger in the header
    const priceHeader = screen.getByRole('columnheader', { name: 'Price' });
  const filterTrigger = priceHeader.querySelector('.ant-table-filter-trigger');
    expect(filterTrigger).toBeTruthy();
    fireEvent.click(filterTrigger);

    // The filter dropdown renders an input with placeholder `Search Price`
  const filterInput = await screen.findByPlaceholderText('Search Price');
  fireEvent.change(filterInput, { target: { value: '20' } });

  // Click Search button inside the dropdown (scope to dropdown container)
  const dropdown = filterInput.closest('div');
  const searchBtn = within(dropdown).getByText('Search');
  fireEvent.click(searchBtn);

    // Only Cherry (price 20) should be visible
    await waitFor(() => {
      expect(screen.queryByText('Cherry')).toBeInTheDocument();
      expect(screen.queryByText('Apple')).toBeNull();
      expect(screen.queryByText('Banana')).toBeNull();
    });
  });

  test('pagination changes pages and shows correct rows', async () => {
    const { container: _container3 } = render(<EnhancedTable columns={columns} dataSource={data} defaultPageSize={1} />);

    // Page 1 should show the first item (Apple)
    expect(await screen.findByText('Apple')).toBeInTheDocument();

    // Click page 2 list item (AntD renders pagination pages as list items)
    const page2 = _container3.querySelector('.ant-pagination .ant-pagination-item-2');
    expect(page2).toBeTruthy();
    fireEvent.click(page2);

    // Now the visible row should be Banana (second item)
    expect(await screen.findByText('Banana')).toBeInTheDocument();
  });
});
