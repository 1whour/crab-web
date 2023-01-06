<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.task_id" placeholder="任务id" style="width: 200px;" class="filter-item"
        @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-date-picker size="small" style="height: 40px" v-model="searchTimeRange" class="filter-item"
        type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
        align="right">></el-date-picker>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查找结果
      </el-button>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleDeleteFilter">
        删除结果
      </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;"
      @sort-change="sortChange">
      <el-table-column label="ID" prop="id" sortable="ID" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.ID }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务id" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.task_id }} </span>
        </template>
      </el-table-column>
      <el-table-column label="任务名" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.task_name }} </span>
        </template>
      </el-table-column>
      <el-table-column label="任务类型" width="70px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.task_type }} </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="task_status" sortable="task_status" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.task_status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" width="220px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.start_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" width="220px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.end_time }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="getResult(row)">
            详细日志
          </el-button>
          <el-button v-if="row.status != 'deleted'" size="mini" type="danger" @click="handleDelete(row, $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
      @pagination="getList" />


    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :v-model="detailData">

      <span>{{ detailData.result }} </span>

    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchPv, deleteList } from '@/api/resultlist'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      searchTimeRange: {},
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        username: undefined,
        type: undefined,
        sort: '+id',
        start_time: undefined,
        end_time: undefined
      },
      detailData: {
        result: "",
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      rulesData: ['admin', 'editer'],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        start_time: undefined,
        end_time: undefined,
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        username: [{ required: true, message: 'username is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.start_time = this.searchTimeRange[0]
      this.listQuery.end_time = this.searchTimeRange[1]
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.2 * 1000)
      })
    },
    delList() {
      this.listLoading = true
      this.listQuery.start_time = this.searchTimeRange[0]
      this.listQuery.end_time = this.searchTimeRange[1]
      var tmpData = {
        start_time: this.searchTimeRange[0],
        end_time: this.searchTimeRange[1],
        task_id: this.task_id,
        page: this.listQuery.page,
        limit: this.listQuery.limit,
        need_update: true,
      }
      deleteList(tmpData).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDeleteFilter() {
      this.listQuery.page = 1
      this.delList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id' || prop === 'task_status') {
        this.sortByID(order, prop)
      }
    },
    sortByID(order, prop) {
      if (order === 'ascending') {
        this.listQuery.sort = '+' + prop
      } else {
        this.listQuery.sort = '-' + prop
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        task_id: undefined,
        type: ''
      }
    },
    getResult(row) {
      this.detailData.result = row.result
      this.dialogFormVisible = true
    },
    handleDelete(row, index) {
      deleteList({ ID: row.ID, task_id: row.task_id, task_name: row.task_name }).then(() => {
        this.list.splice(index, 1)
        this.dialogFormVisible = false
        this.$notify({
          username: 'Success',
          message: 'Update Successfully',
          type: 'success',
          duration: 2000
        })
      })
    },
    getSortClass: function (key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
