<template>
  <div class="app-container anomaly-models">
    <el-table
      :data="list"
      fit
      stripe
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column :label="$t('table.name')" prop="Name" sortable align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.Name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.description')" prop="Description" sortable align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.Description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'Creation'" sortable prop="Creation_Time" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.CreationTime | timestampToDate }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="'Modification'" sortable prop="Modification_Time" align="center">
        <template slot-scope="scope">
          <span class="link-type">{{ scope.row.ModificationTime | timestampToDate }}</span>
        </template>
      </el-table-column>


<!--       <el-table-column :label="$t('table.actions')" fixed="right" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>  -->
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="getList" />
  </div>
</template>

<script>
import { models } from '@/request/ips/IpsManagerRequest'
import { login } from '@/request/ips/login'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'AnomalyModels',
  components: { Pagination },
  data () {
    return {
      list: [],
      total: 0,
      params: {
        page: 1,
        limit: 10,
        offset: 0,
        search_key: undefined,
        sort_by: 'Modification_Time',
        order_by: 'desc'
      }
    }
  },
  created () {
    login()
    .then(() => {
      this.getList()
    })
  },
  watch: {
    'params.page'() {
      this.params.offset = this.params.page * this.params.limit
    }
  },
  methods: {
    sortChange(data) {
      const { prop, order_by } = data
        this.sortBy(prop, order_by)
    },
    getList () {
      models(this.params)
        .then(res => {
          this.list = res.data.data
          this.total = res.data.total_items
        })
    },
    sortBy(col, order) {
      this.params.sort_by = col
      if (order === 'ascending') {
        this.params.order_by = 'asc'
      } else {
        this.params.order_by = 'desc'
      }
      this.getList()
    },
  }
}
</script>
