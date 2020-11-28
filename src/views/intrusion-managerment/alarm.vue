<template>
  <div class="app-container alarm">
    <el-card shadow="always">
      <h3>Danh mục các cảnh báo thu nhận từ các hệ thống NetIPS</h3>
      <div class="kibanaframe">
          <iframe src="https://ipskibana.uetis.com/s/ipsmanager/app/dashboards#/view/076caa20-64aa-11e8-9e8d-39632dc6b766?embed=true&_g=(filters%3A!()%2CrefreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15d%2Cto%3Anow))&show-time-filter=true&hide-filter-bar=true" class="frame"></iframe>
      </div>
    </el-card>
  </div>
</template>

<script>

export default {
  name: 'Alarm'
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
