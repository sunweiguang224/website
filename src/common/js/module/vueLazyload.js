export default {
  init(isLoading) {
    // 懒加载全局设置
    document.body.style.display = 'none';
    if (isLoading) {
      Vue.use(VueLazyload, {
        loading: '//pic.davdian.com/free/2016/12/28/519_360_fdc5daf1d2eab033a50af9f80246da60.png',
        error: '//pic.davdian.com/free/2016/12/28/519_360_fdc5daf1d2eab033a50af9f80246da60.png',
        try: 2,
        preLoad: 1.5
      });
    } else {
      Vue.use(VueLazyload, {
        // loading: '//pic.davdian.com/free/2016/12/28/519_360_fdc5daf1d2eab033a50af9f80246da60.png',
        // error: '//pic.davdian.com/free/2016/12/28/519_360_fdc5daf1d2eab033a50af9f80246da60.png',
        try: 2,
        preLoad: 1.5
      });
    }
    document.body.style.display = null;
  },
}
