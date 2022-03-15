import groupBy from 'lodash.groupby'
//
import linkStyle from './link-style'
import linkKey from './link-key'
import settings from '../../../../lib/link'

export default function layoutSecondaryLinks (getters, rootGetters) {
  const linksByChild = groupBy(rootGetters['whakapapa/secondaryLinks'], 'child')

  // TODO - check handles old rules gracefully
  // A Current Rule is one which has a target, a valid primary node, and ANY other node which would
  // lead to this rule being needed

  return Object.entries(linksByChild).reduce(
    (acc, [childId, childLinks]) => {
      const childNode = getters.getNode(childId)

      if (!childNode) {
        console.log('cannot find childNode', childId)
        return acc
      }

      // TODO come back to find midpoints of parents who are partners
      // (see multiLink in layout-child-links ?)
      childLinks.forEach(childLink => {
        const parentNode = getters.getNode(childLink.parent) || getters.getPartnerNode(childLink.parent)
        if (!parentNode) {
          console.log('cannot find parentNode', childLink.parent)
          return
        }

        acc.push(link(parentNode, childNode, childLink.relationshipType))
      })

      return acc
    },
    []
  )
}

const LINK_OFFSET = 10
function link (fromNode, toNode, relType) {
  const isDashed = relType && (relType !== 'birth') && (relType !== 'partner')

  const coords = {
    startX: fromNode.x,
    startY: fromNode.y,
    endX: toNode.x,
    endY: toNode.y,

    directed: relType !== 'partner'
  }
  if (relType === 'partner') console.error('surprise! I did not think partner links were possible here')

  const offsetX = (coords.startX < coords.endX) ? LINK_OFFSET : -LINK_OFFSET
  if (fromNode.children && fromNode.children.length) coords.startX += offsetX
  coords.endX -= offsetX

  return {
    key: linkKey('secondary', fromNode, toNode),
    parent: fromNode.data.id,
    child: toNode.data.id,
    d: settings.path(coords),
    style: linkStyle({
      stroke: '#b22526',
      strokeDasharray: isDashed ? 2.5 : 0
    })
  }
}
