<template>
  <div class="app-container search">
    <el-card shadow="always">
      <h3>Tìm kiếm trong dữ liệu xâm nhập mạng đã thu thập được từ các hệ thống NetIPS</h3>
      <iframe src="https://ipskibana.uetis.com/s/ipsmanager/app/dashboards#/view/3f15a1f0-6696-11e8-a67b-cd4cf123b2a5?embed=true&_g=(filters%3A!()%2CrefreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15d%2Cto%3Anow))&show-time-filter=true&hide-filter-bar=true" 
          class="frame">
      </iframe>
    </el-card>
  </div>
</template>

<script>

export default {
  name: 'search'
}
</script>


<style lang="scss" scoped>
.search {
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
