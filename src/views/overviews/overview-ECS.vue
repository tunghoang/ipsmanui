<template>
  <div class="app-container alarm">
    <el-card shadow="always">
      <h3>[Metricbeat System] Overview ECS</h3>
      <div class="kibanaframe">
          <iframe src="http://112.137.129.214:56010/app/dashboards#/view/Metricbeat-system-overview-ecs?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(description:'Overview%20of%20system%20metrics',filters:!(),fullScreenMode:!f,options:(darkTheme:!f),query:(language:kuery,query:''),tags:!(),timeRestore:!f,title:'%5BMetricbeat%20System%5D%20Overview%20ECS',viewMode:view)" class="frame"></iframe>
      </div>
    </el-card>
  </div>
</template>

<script>

export default {
  name: 'OverviewECS'
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
