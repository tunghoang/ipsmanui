<template>
  <div class="app-container alarm">
    <el-card shadow="always">
      <h3>ModSecurity Overview</h3>
      <div class="kibanaframe">
          <iframe src="http://112.137.129.214:56010/app/dashboards#/view/037170d0-9ae0-11eb-b0f6-071481d90ab1?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(description:'',filters:!(),fullScreenMode:!f,options:(hidePanelTitles:!f,useMargins:!t),query:(language:kuery,query:''),tags:!('3d738fb0-9aaf-11eb-b0f6-071481d90ab1'),timeRestore:!f,title:'ModSecurity%20Overview',viewMode:view)" class="frame"></iframe>
      </div>
    </el-card>
  </div>
</template>

<script>

export default {
  name: 'ModSecurity'
}
</script>

<style lang="scss" scoped>
.alarm {
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
