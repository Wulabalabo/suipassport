import { graphql } from '@mysten/sui/graphql/schemas/latest'

export const getCollectionDetail = graphql(`
    query getCollectionDetail($address: SuiAddress!, $after: String) {
    owner(address: $address) {
        dynamicFields(after: $after) {
            pageInfo{
                hasNextPage
                endCursor
            }
            nodes {
                name {
                    json
                }
            }
        }
    }
}
`)