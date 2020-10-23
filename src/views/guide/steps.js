import i18n from '@/lang'

const steps = [
  {
    element: '#hamburger-container',
    popover: {
      title: 'Hamburger',
      description: `${i18n.t('Open && Close sidebar')}`,
      position: 'bottom'
    }
  },
  {
    element: '#breadcrumb-container',
    popover: {
      title: 'Breadcrumb',
      description: `${i18n.t('Indicate the current page location')}`,
      position: 'bottom'
    }
  },
  {
    element: '#header-search',
    popover: {
      title: 'Page Search',
      description: `${i18n.t('Page search, quick navigation')}`,
      position: 'left'
    }
  },
  {
    element: '#screenfull',
    popover: {
      title: 'Screenfull',
      description: `${i18n.t('Set the page into fullscreen')}`,
      position: 'left'
    }
  },
  {
    element: '#size-select',
    popover: {
      title: 'Switch Size',
      description: `${i18n.t('Switch the system size')}`,
      position: 'left'
    }
  },
  {
    element: '#tags-view-container',
    popover: {
      title: 'Tags view',
      description: `${i18n.t('The history of the page you visited')}`,
      position: 'bottom'
    },
    padding: 0
  }
]

export default steps
