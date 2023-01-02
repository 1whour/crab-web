<template>

  <el-dialog title="提示" :visible.sync="dialogVisible" width="100%" :before-close="handleClose">
    <div>
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane v-for="(item, index) in editableTabs" :label="item.label" :name="item.name">
        </el-tab-pane>
      </el-tabs>

      <div v-if="editableTabs[0].show === true">
        <el-form ref=" form" :model="form" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="任务名称">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="触发条件">
                <el-input placeholder="请输入内容" v-model="form.trigger" class="input-with-select">
                  <el-select v-model="form.select" slot="prepend" placeholder="请选择">
                    <el-option label="crontab表达式" value="1234"></el-option>
                    <el-option label="一次性任务" value="1234"></el-option>
                  </el-select>
                  <el-button slot="append" icon="el-icon-plus"></el-button>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="http/https">
                <el-select v-model="schemeValue" placeholder="请选择method方法" class="method-select" size="big">
                  <el-option v-for="item in schemeOptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="method">
                <el-select v-model="methodValue" placeholder="请选择method方法" class="method-select" size="big">
                  <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="URL">
                <el-input v-model="form.URL" class="edit-input" size="small"
                  style="float:right;margin-bottom:10px;z-index:1;position:relative" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="Headers">
                <el-divider></el-divider>
                <el-table :data="tableData" style="width: 100%">

                  <el-table-column min-width="230px" label="KEY">
                    <template slot-scope="{row}">
                      <template v-if="row.edit">
                        <el-input v-model="row.key" class="edit-input" size="small"
                          style="float:right;margin-bottom:10px;z-index:1;position:relative" />
                      </template>
                      <span v-else>{{ row.key }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column min-width="230px" label="VALUE">
                    <template slot-scope="{row}">
                      <template v-if="row.edit">
                        <el-input v-model="row.value" class="edit-input" size="small"
                          style="float:right;margin-bottom:10px;z-index:1;position:relative" />
                      </template>
                      <span v-else>{{ row.value }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column label="操作">
                    <template slot-scope="{row,$index}">
                      <el-button-group style="float:right;margin-bottom:10px;z-index:1;position:relative">

                        <el-button v-if="row.edit" type="success" size="small" icon="el-icon-circle-check-outline"
                          @click="confirmEdit(row)">
                          Ok
                        </el-button>
                        <el-button v-else type="primary" size="small" icon="el-icon-edit" @click="row.edit = !row.edit">
                          Edit
                        </el-button>

                        <el-button type="danger" size="small" icon="el-icon-delete"
                          @click="headerHandleDelete($index, row)">删除</el-button>
                      </el-button-group>
                    </template>
                  </el-table-column>

                </el-table>
              </el-form-item>
            </el-col>
            <el-row>
              <div style="margin:20px; text-align:right">
                <el-button type="success" icon="el-icon-folder-add" @click="headerAddRow" size="small">新增</el-button>
              </div>
            </el-row>

          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="body">
                <el-input type="textarea" v-model="form.body" :rows=8></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item>
            <el-button type="primary" @click="onSubmit">立即创建</el-button>
            <el-button>取消</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="editableTabs[1].show === true">
        <el-form ref="form" :model="form" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="任务名称">
                <el-input v-model="form.name"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="触发条件">
                <el-input placeholder="请输入内容" v-model="form.trigger" class="input-with-select">
                  <el-select v-model="form.select" slot="prepend" placeholder="请选择">
                    <el-option label="crontab表达式" value="1234"></el-option>
                    <el-option label="一次性任务" value="1234"></el-option>
                  </el-select>
                  <el-button slot="append" icon="el-icon-plus"></el-button>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="shell脚本">
                <el-input type="textarea" v-model="form.body" :rows=8></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
  </el-dialog>
</template>

<style>
.el-select .el-input {
  width: 140px;
}

.input-with-select .el-input-group__prepend {
  background-color: #fff;
}

.method-select {
  width: 200px;
}
</style>
<script>
// 参考
// https://www.jianshu.com/p/b0259e728a39
export default {
  data() {
    return {
      activeName: 'first',
      editableTabs: [
        { name: "http_task", label: "创建http任务", show: true }, // 默认值
        { name: "shell_task", label: "创建shell任务", show: false },
        { name: "lambda_task", label: "创建lambda任务", show: false },
      ],
      form: {
        name: '',
        scheme: '',
        method: '',
        type: [],
        trigger: '',
        URL: '',
        activeName: '',
        select: ''
      },
      dialogVisible: false,
      schemeOptions: [
        {
          value: 'HTTP',
          label: 'HTTP'
        },
        {
          value: 'HTTPS',
          label: 'HTTPS'
        },
      ],
      methodOptions: [
        {
          value: 'GET',
          label: 'GET'
        },
        {
          value: 'POST',
          label: 'POST'
        },
        {
          value: 'PUT',
          label: 'PUT'
        },
        {
          value: 'DELETE',
          label: 'DELETE'
        },
        {
          value: 'PATCH',
          label: 'PATCH'
        },
      ],
      schemeValue: 'http',
      methodValue: 'GET',
      tableData: [
      ]
    }
  },
  methods: {
    init() {
      this.dialogVisible = true
    },
    headerAddRow() {
      const item = {
        key: '',
        value: '',
        edit: true,
      }
      this.tableData.push(item)
    },
    confirmEdit(row) {
      row.edit = false
      row.originalTitle = row.title
      this.$message({
        message: 'http header key 和 value已经编辑',
        type: 'success'
      })
    },
    headerHandleDelete(index, row) {
      this.tableData.splice(index, 1)
    },
    onSubmit() {
      console.log('submit!');
    },
    handleClick(el) {
      this.editableTabs[el.index].show = true
      for (var i = 0; i < this.editableTabs.length; i++) {
        if (i == el.index) {
          continue
        }
        this.editableTabs[i].show = false
      }
      console.log('handleClick!', el, this.editableTabs.length, this.editableTabs);
    }
  }
}
</script>
