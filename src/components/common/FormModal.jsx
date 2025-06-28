import React from 'react';
import { Modal, Form } from 'antd';
import { ActionButton } from './ActionButton';

export function FormModal({
  title,
  open,
  onCancel,
  onSubmit,
  form,
  children,
  width = 600,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  ...props
}) {
  const handleSubmit = () => {
    form.validateFields()
      .then((values) => {
        onSubmit?.(values);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      width={width}
      footer={[
        <ActionButton key="cancel" onClick={onCancel}>
          {cancelText}
        </ActionButton>,
        <ActionButton.Primary 
          key="submit" 
          onClick={handleSubmit}
          loading={loading}
        >
          {submitText}
        </ActionButton.Primary>
      ]}
      destroyOnClose
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        {children}
      </Form>
    </Modal>
  );
}