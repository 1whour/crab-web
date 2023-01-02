import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: "/crab/ui/task/status",
    method: 'get',
    params: query
  })
}
