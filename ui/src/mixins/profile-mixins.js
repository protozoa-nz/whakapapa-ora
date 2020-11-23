import { getProfile } from '@/lib/person-helpers.js'
import { getTribe } from '@/lib/community-helpers.js'
import tree from '@/lib/tree-helpers.js'

export default function mapProfileMixins ({ mapMethods, mapApollo }) {
  var customMixin = {}
  if (mapMethods) {
    customMixin.methods = {}

    mapMethods.forEach(m => {
      if (methods[m]) customMixin.methods[m] = methods[m]
    })
  }

  if (mapApollo) {
    customMixin.apollo = {}

    mapApollo.forEach(m => {
      if (apollo[m]) customMixin.apollo[m] = apollo[m]
    })
  }

  return customMixin
}

const apollo = {
  profile () {
    return {
      ...getProfile,
      skip () {
        return this.$route.name === 'tribe' // skip calling this immediately if on the tribe page
      },
      /*
        NOTE: when variables is a function, it is reactive, so when the route profileId changes,
        profile is updated automatically for you
      */
      variables () {
        return {
          id: this.$route.params.profileId
        }
      },
      error (err) {
        console.error('There was an error fetching the profile with id: ', this.$route.params.profileId)
        console.error(err)
      },
      update (data) {
        var profile = data.person
        console.log('profile', profile)
        if (profile.children) {
          profile.children = profile.children.map(child => {
            var childProfile = child.profile
            childProfile = {
              ...childProfile,
              relationshipType: child.relationshipType
            }
            profile = tree.getPartners(profile, childProfile)
            return childProfile
          })
        }
        if (profile.parents) {
          profile.parents = profile.parents.map(parent => {
            var parentProfile = parent.profile
            profile = tree.getSiblings(parentProfile, profile)
            parentProfile = {
              ...parentProfile,
              relationshipType: parent.relationshipType
            }
            return parentProfile
          })
        }

        return profile
      }
    }
  },
  tribe () {
    return {
      skip () {
        return this.$route.params.tribeId === this.whoami.personal.groupId
      },
      ...getTribe,
      variables () {
        return {
          id: this.$route.params.tribeId
        }
      },
      error: err => console.error('Error getting tribe', err),
      update ({ tribe }) {
        if (tribe.private.length > 0) return { groupId: tribe.id, ...tribe.private[0] }
        return { groupId: tribe.id, ...tribe.public[0] }
      }
    }
  }
}

const methods = {
  async getTribe (id) {
    try {
      if (id === this.whoami.personal.groupId) {
        return {
          groupId: this.whoami.personal.groupId,
          ...this.whoami.personal.profile
        }
      }

      const res = await this.$apollo.query({
        ...getTribe,
        variables: {
          id
        }
      })

      if (res.errors) throw res.errors

      const tribe = res.data.tribe

      return {
        id: tribe.id,
        ...(tribe.private.length > 0 ? tribe.private[0] : tribe.public[0])
      }
    } catch (err) {
      console.error('Something went wrong while fetching tribe: ', id)
      console.error(err)
    }
  },
  async getProfile (id) {
    try {
      const res = await this.$apollo.query({
        ...getProfile,
        variables: { id }
      })

      if (res.errors) throw res.errors

      return res.data.person
    } catch (err) {
      console.error('Something went wrong while fetching profile: ', id)
      console.error(err)
    }
  }
}
