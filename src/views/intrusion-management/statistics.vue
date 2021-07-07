<template>
  <div class="app-container statistics">
    <el-card shadow="always">
      <h3>ttttttTổng hợp, thống kê dữ liệu xâm nhập mạng đã thu thập được từ các hệ thống NetIPS</h3>
      <div class="kibanaframe">
        <iframe src="https://ipskibana.uetis.com/s/ipsmanager/app/dashboards#/view/61eb53a0-6696-11e8-a67b-cd4cf123b2a5?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15d,to:now))&_a=(description:'',filters:!(),fullScreenMode:!t,options:(darkTheme:!f,hidePanelTitles:!f,useMargins:!f),query:(language:lucene,query:''),timeRestore:!f,title:'IPSManager:%20Statistics',viewMode:view)" class="frame"></iframe>
      </div>
    </el-card>
  </div>
</template>

<script>

export default {
  name: 'Statistics'
}
</script>

<style lang="scss" scoped>
.statistics {
  .frame {
    display: block;
    width: 100vw;
    height: 100vh;
    max-width: 100%;
    margin: 0;
    padding: 0;
    border: 0 none;
    box-sizing: border-box;
  }
}
</style>
