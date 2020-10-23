<template>
  <div class="app-container">
    <aside>
      {{ $t('guide.intro') }}
    </aside>
    <el-button icon="el-icon-question" type="primary" @click.prevent.stop="guide">
      {{ $t('guide.show') }}
    </el-button>
  </div>
</template>

<script>
import Driver from 'driver.js' // import driver.js
import 'driver.js/dist/driver.min.css' // import driver.js css
import steps from './steps'

export default {
  name: 'Guide',
  data() {
    return {
      driver: null
    }
  },
  mounted() {
    this.driver = new Driver({
      nextBtnText: this.$t('guide.next'),
      prevBtnText: this.$t('guide.previous'),
      doneBtnText: this.$t('guide.done'),
      closeBtnText: this.$t('guide.close'),
    })
  },
  methods: {
    guide() {
      this.driver.defineSteps(steps)
      this.driver.start()
    }
  }
}
</script>
