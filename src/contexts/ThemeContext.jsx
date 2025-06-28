import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const initialState = {
  branding: {
    companyName: 'VCare Furniture Store',
    logo: '/VCARELogo 1.png',
    tagline: 'Premium Furniture Solutions',
    primaryColor: '#0E72BD',
    secondaryColor: '#1890ff',
    accentColor: '#52c41a'
  },
  theme: {
    mode: 'light', // light, dark
    borderRadius: 8,
    fontSize: 14,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    compactMode: false,
    animations: true
  },
  layout: {
    sidebarCollapsed: false,
    headerFixed: true,
    footerVisible: true,
    contentPadding: 24
  }
};

function themeReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_BRANDING':
      return {
        ...state,
        branding: { ...state.branding, ...action.payload }
      };
    case 'UPDATE_THEME':
      return {
        ...state,
        theme: { ...state.theme, ...action.payload }
      };
    case 'UPDATE_LAYOUT':
      return {
        ...state,
        layout: { ...state.layout, ...action.payload }
      };
    case 'RESET_TO_DEFAULT':
      return initialState;
    default:
      return state;
  }
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('vcare_theme_settings');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        dispatch({ type: 'UPDATE_BRANDING', payload: parsed.branding || {} });
        dispatch({ type: 'UPDATE_THEME', payload: parsed.theme || {} });
        dispatch({ type: 'UPDATE_LAYOUT', payload: parsed.layout || {} });
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      }
    }
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('vcare_theme_settings', JSON.stringify(state));
  }, [state]);

  const updateBranding = (branding) => {
    dispatch({ type: 'UPDATE_BRANDING', payload: branding });
  };

  const updateTheme = (theme) => {
    dispatch({ type: 'UPDATE_THEME', payload: theme });
  };

  const updateLayout = (layout) => {
    dispatch({ type: 'UPDATE_LAYOUT', payload: layout });
  };

  const resetToDefault = () => {
    dispatch({ type: 'RESET_TO_DEFAULT' });
  };

  // Generate Ant Design theme configuration
  const getAntdTheme = () => {
    const { branding, theme: themeSettings } = state;
    
    return {
      algorithm: themeSettings.mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: branding.primaryColor,
        colorSuccess: branding.accentColor,
        borderRadius: themeSettings.borderRadius,
        fontSize: themeSettings.fontSize,
        fontFamily: themeSettings.fontFamily,
        colorBgContainer: themeSettings.mode === 'dark' ? '#1f1f1f' : '#ffffff',
        colorBgLayout: themeSettings.mode === 'dark' ? '#141414' : '#f8fafc',
        colorText: themeSettings.mode === 'dark' ? '#ffffff' : '#1f2937',
        colorTextSecondary: themeSettings.mode === 'dark' ? '#a3a3a3' : '#6b7280',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.15)',
        motionDurationSlow: themeSettings.animations ? '0.3s' : '0s',
        motionDurationMid: themeSettings.animations ? '0.2s' : '0s',
        motionDurationFast: themeSettings.animations ? '0.1s' : '0s',
      },
      components: {
        Layout: {
          headerBg: themeSettings.mode === 'dark' ? '#1f1f1f' : '#ffffff',
          siderBg: themeSettings.mode === 'dark' ? '#1f1f1f' : '#ffffff',
          bodyBg: themeSettings.mode === 'dark' ? '#141414' : '#f8fafc',
          headerHeight: 64,
          footerBg: themeSettings.mode === 'dark' ? '#1f1f1f' : '#ffffff',
        },
        Card: {
          borderRadiusLG: themeSettings.borderRadius + 4,
          boxShadowTertiary: '0 2px 8px rgba(0, 0, 0, 0.1)',
          paddingLG: themeSettings.compactMode ? 16 : 24,
        },
        Button: {
          borderRadius: themeSettings.borderRadius,
          controlHeight: themeSettings.compactMode ? 32 : 40,
          fontWeight: 500,
          primaryShadow: `0 2px 8px ${branding.primaryColor}40`,
        },
        Input: {
          borderRadius: themeSettings.borderRadius,
          controlHeight: themeSettings.compactMode ? 32 : 40,
        },
        Select: {
          borderRadius: themeSettings.borderRadius,
          controlHeight: themeSettings.compactMode ? 32 : 40,
        },
        Table: {
          borderRadiusLG: themeSettings.borderRadius + 4,
          headerBg: `${branding.primaryColor}08`,
          rowHoverBg: `${branding.primaryColor}04`,
        },
        Modal: {
          borderRadiusLG: themeSettings.borderRadius + 8,
        },
        Menu: {
          itemBorderRadius: themeSettings.borderRadius,
          itemMarginInline: 4,
          itemMarginBlock: 2,
          itemSelectedBg: `${branding.primaryColor}15`,
          itemSelectedColor: branding.primaryColor,
        },
        Tabs: {
          itemSelectedColor: branding.primaryColor,
          itemHoverColor: branding.primaryColor,
          inkBarColor: branding.primaryColor,
        },
        Progress: {
          defaultColor: branding.primaryColor,
        },
        Switch: {
          colorPrimary: branding.primaryColor,
        },
        Radio: {
          colorPrimary: branding.primaryColor,
        },
        Checkbox: {
          colorPrimary: branding.primaryColor,
        },
      },
    };
  };

  return (
    <ThemeContext.Provider value={{
      ...state,
      updateBranding,
      updateTheme,
      updateLayout,
      resetToDefault,
      getAntdTheme
    }}>
      <ConfigProvider theme={getAntdTheme()}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}