import gql from 'graphql-tag'
import pick from 'lodash.pick'
// import {
//   createProvider
// } from '@/plugins/vue-apollo'

// const apolloProvider = createProvider()
// const apolloClient = apolloProvider.defaultClient

export const PERMITTED_COMMUNITY_ATTRS = [
  'id',
  'type',

  'preferredName',
  // 'legalName',
  // 'altNames',

  'description',
  'avatarImage',
  'headerImage',

  'email',
  'phone',
  'address',
  'location',

  'tombstone',
  'recps'
]

export const PERMITTED_PUBLIC_COMMUNITY_ATTRS = [
  'id',
  'preferredName',
  'avatarImage',
  'description',
  'headerImage',
  'email',
  'phone',
  'location',
  'tombstone'
]

export const PERMITTED_COMMUNITY_LINK_ATTRS = [
  'id',
  'profile',
  'group',
  'allowPublic'
]

// TODO: finish community-helper
// eg: getCommunity() *single community

export const createGroup = () => {
  return {
    mutation: gql`
      mutation($nothing: Boolean) {
        createGroup(nothing: $nothing) {
          id
        }
      }
    `,
    variables: { nothing: true }
  }
}

export const saveCommunity = input => {
  const _input = prune(input, PERMITTED_COMMUNITY_ATTRS)

  if (!_input.id) _input.type = 'community'

  return {
    mutation: gql`
      mutation($input: ProfileInput!) {
        saveProfile(input: $input)
      }
    `,
    variables: {
      input: _input
    }
  }
}

export const savePublicCommunity = input => {
  const _input = prune(input, PERMITTED_PUBLIC_COMMUNITY_ATTRS)

  if (!_input.id) _input.type = 'community'
  _input.allowPublic = true

  return {
    mutation: gql`
      mutation($input: ProfileInput!) {
        saveProfile(input: $input)
      }
    `,
    variables: {
      input: _input
    }
  }
}

export const saveGroupProfileLink = input => {
  const _input = prune(input, PERMITTED_COMMUNITY_LINK_ATTRS)

  return {
    mutation: gql`
      mutation($input: GroupProfileLinkInput!) {
        saveGroupProfileLink(input: $input)
      }
    `,
    variables: {
      input: _input
    }
  }
}

export const deleteTribe = tribe => {
  return {
    mutation: gql`
      mutation($privateInput:ProfileInput, $publicInput:ProfileInput) {
        deletePrivate: saveProfile(input:$privateInput)
        deletePublic: saveProfile(input:$publicInput)
      }
    `,
    variables: {
      privateInput: {
        id: tribe.private[0].id,
        tombstone: { date: new Date() }
      },
      publicInput: {
        id: tribe.public[0].id,
        tombstone: { date: new Date() },
        allowPublic: true
      }
    }
  }
}

export const getTribes = ({
  query: gql`query {
    tribes {
      id
      public {
        id
        preferredName
        description
        avatarImage { uri } 
        description
        headerImage { uri }
        tombstone { date }
      }
      private {
        id
        preferredName
        description
        avatarImage { uri }
        headerImage { uri }
        recps
        tombstone {date}
      }
    }
  }
`,
  fetchPolicy: 'no-cache'
})

function prune (input, attrs) {
  const _input = pick(input, attrs)
  Object.entries(_input).forEach(([key, value]) => {
    if (value === '') {
      delete _input[key]
    }
  })
  return _input
}
