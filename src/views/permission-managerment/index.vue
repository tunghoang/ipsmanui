<template>
  <div class="app-container role-managerment">
    permission
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import rf from 'requestfactory'
import { Message } from 'element-ui'
import RemoveErrorsMixin from 'common/RemoveErrorsMixin'

export default {
  name: 'EngineList',
  components: { Pagination },
  directives: { waves },
  mixins: [RemoveErrorsMixin]
}
</script>
