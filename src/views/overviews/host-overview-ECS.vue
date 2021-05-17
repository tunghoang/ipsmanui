<template>
  <div class="app-container alarm">
    <el-card shadow="always">
      <h3>[Metricbeat System] Host overview ECS: {{ hostname }}</h3>
      <div class="kibanaframe">
          <iframe :src="url" class="frame"></iframe>
      </div>
    </el-card>
  </div>
</template>

<script>

export default {
  name: 'HostOverviewECS',
  data: function() {
    return {
      base: "http://112.137.129.214:56010/app/dashboards#/view/79ffd6e0-faa0-11e6-947f-177f697178b8-ecs",
      filter: "filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now)",
      hostname: "",
    }
  },
  computed: {
    url: function() {
      let _url = `${this.base}?_g=(${this.filter})&_a=(${this.info})`
      return encodeURI(_url);
    },
    info: function() {
      return 'description:\'Overview of host metrics\',filters:!(),fullScreenMode:!f,options:(darkTheme:!f),query:(language:kuery,query:\'host.name:"' + this.hostname + '"\'),tags:!(),timeRestore:!f,title:\'[Metricbeat System] Host overview ECS\',viewMode:view';
    }
  },

  created () {
    this.hostname = this.$route.params.hostname === ':hostname' ? '': this.$route.params.hostname
  }
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
