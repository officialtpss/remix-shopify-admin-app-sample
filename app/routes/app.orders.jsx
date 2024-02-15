import {
    IndexTable,
    Page, 
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta = () => {
    return [{ title: "Orders" }];
};

export const loader = async ({ request }) => {
    const { admin } = await authenticate.admin(request);
    const response = await admin.graphql(
        `query MyQuery {
        orders(first: 50, reverse: true,) {
          edges {
            node {
              id
              createdAt
              customer {
                firstName
              }
              displayFulfillmentStatus
              email
              originalTotalPriceSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }`);
    const responseJson = await response.json();
    const orders = await responseJson?.data?.orders?.edges?.map(row => row?.node).map(
        row => {
            return {
                ...row,
                ...row?.customer,
                ...row?.originalTotalPriceSet?.presentmentMoney
            }
        }
    );
    return json({
        orders
    });
};

export default function Orders() {
    const { orders } = useLoaderData();
    const resourceName = {
        singular: 'order',
        plural: 'orders',
    };
    const rowMarkup = orders.map(
        (
            { id, amount, createdAt, email, firstName },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell>#{id?.replace('gid://shopify/Order/', '')}</IndexTable.Cell>
                <IndexTable.Cell>{firstName}</IndexTable.Cell>
                <IndexTable.Cell>{email}</IndexTable.Cell>
                <IndexTable.Cell>{amount}</IndexTable.Cell>
                <IndexTable.Cell>{createdAt}</IndexTable.Cell>
            </IndexTable.Row>
        ),
    );
    return (
        <Page title="Orders" fullWidth>
            <IndexTable
                resourceName={resourceName}
                itemCount={orders.length}
                headings={[
                    { title: 'Order Id' },
                    { title: 'Name' },
                    { title: 'Email' },
                    { title: 'Total' },
                    { title: 'Created' },
                ]}
                selectable={false}
            >
                {rowMarkup}
            </IndexTable>
        </Page>
    );
}


