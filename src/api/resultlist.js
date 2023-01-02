import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: "/crab/ui/task/result/list",
    method: 'get',
    params: query
  })
}

export function deleteList(data) {
  return request({
    url: "/crab/ui/task/result",
    method: 'delete',
    data
  })
}
