<template>
  <div class="dashboard-editor-container">
    <Panel></Panel>
  </div>
</template>

<script>
import Panel from '../panel'
export default {
  name: 'DashboardAdmin',
  data() {
    return {
      summary: {}
    }
  },
  components: {
    Panel
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>


