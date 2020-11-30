<template>
  <div class="app-container intrusion-monitoring">
    <el-card shadow="always">
      <h3>Tổng quan các sự kiện xâm nhập được phát hiện từ các hệ thống phát hiện/phòng chống xâm nhập mạng NetIPS</h3>
      <iframe src="https://ipskibana.uetis.com/s/ipsmanager/app/dashboards#/view/a7f80970-64ec-11e8-9e8d-39632dc6b766?embed=true&_g=(filters%3A!()%2CrefreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15d%2Cto%3Anow))&show-time-filter=true&hide-filter-bar=true" class="frame">></iframe>
    </el-card>
  </div>
</template>

<script>

export default {
  name: 'IntrusionMonitoring'
}
</script>

<style lang="scss" scoped>
.intrusion-monitoring {
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
