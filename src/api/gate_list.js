import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: "/crab/ui/gate/list",
    method: 'get',
    params: query
  })
}

