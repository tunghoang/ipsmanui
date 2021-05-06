<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <div>
        <keep-alive :include="cachedViews">
          <router-view :key="key" />
        </keep-alive>
        <Intrusion v-show="checkShow(1)" />
        <Alarm v-show="checkShow(2)" />
        <Anomalies v-show="checkShow(3)" />
        <Search v-show="checkShow(4)" />
        <Statistics v-show="checkShow(5)" />
        <HostOverview v-show="checkShow(6)" />
        <Overview v-show="checkShow(7)" />
        <ModSecurity v-show="checkShow(8)" />
      </div>
    </transition>
  </section>
</template>

<script>
import Intrusion from "../../views/intrusion-management/intrusion-monitoring";
import Alarm from "../../views/intrusion-management/alarm";
import Anomalies from "../../views/intrusion-management/anomaly-events";
import Search from "../../views/intrusion-management/search";
import Statistics from "../../views/intrusion-management/statistics";
import HostOverview from "../../views/overviews/host-overview-ECS";
import Overview from "../../views/overviews/overview-ECS";
import ModSecurity from "../../views/overviews/modsecurity-overview";

export default {
  name: "AppMain",
  components: {
    Intrusion,
    Alarm,
    Anomalies,
    Search,
    Statistics,
    HostOverview,
    Overview,
    ModSecurity
  },
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews;
    },
    key() {
      return this.$route.path;
    },
  },
  methods: {
    checkShow(type) {
      switch (type) {
        case 1:
          return this.$route.path === "/intrusion-management/intrusion";
        case 2:
          return this.$route.path === "/intrusion-management/alarm";
        case 3:
          return this.$route.path === "/intrusion-management/anomalies";
        case 4:
          return this.$route.path === "/intrusion-management/search";
        case 5:
          return this.$route.path === "/intrusion-management/statistics";
        case 6:
          return this.$route.path === "/host-overview-ecs";
        case 7:
          return this.$route.path === "/overview-ecs";
        case 8:
          return this.$route.path === "/modsecurity";
        default:
          return true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    padding-top: 84px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
