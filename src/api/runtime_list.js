import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: "/crab/ui/runtime-node/list",
    method: 'get',
    params: query
  })
}
