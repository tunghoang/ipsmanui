<template>
  <div class="app-container alarm">
    <el-card shadow="always">
      <h3>[Metricbeat System] Host overview ECS</h3>
      <div class="kibanaframe">
          <iframe src="http://112.137.129.214:56010/app/dashboards#/view/79ffd6e0-faa0-11e6-947f-177f697178b8-ecs?_a=(description:'Overview%20of%20host%20metrics',filters:!(),fullScreenMode:!f,options:(darkTheme:!f),query:(language:kuery,query:'host.name:%22192.168.0.45%22'),tags:!(),timeRestore:!f,title:'%5BMetricbeat%20System%5D%20Host%20overview%20ECS',viewMode:view)&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))" class="frame"></iframe>
      </div>
    </el-card>
  </div>
</template>

<script>

export default {
  name: 'HostOverviewECS'
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
