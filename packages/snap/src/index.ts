import { OnTransactionHandler } from '@metamask/snap-types';
import { hasProperty, isObject, Json } from '@metamask/utils';
import { panel, heading, text } from '@metamask/snaps-ui';

// The API endpoint to get a list of functions by 4 byte signature.
const API_ENDPOINT = 'https://beta.credprotocol.com/api/score/address/';

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const insights: { type: string; params?: Json } = {
    type: 'Unknown Transaction',
  };
  if (
    !isObject(transaction) ||
    !hasProperty(transaction, 'data') ||
    typeof transaction.data !== 'string'
  ) {
    console.warn('Unknown transaction type.');
    return { insights };
  }

  // fetch data - cred
  const response = await fetch(`${API_ENDPOINT}${transaction.from}`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Token REDACTED',
    },
  });

  const json = await response.json();

  const score = json.value;
  const address = transaction.from as string;

  if (!response.ok) {
    if (json.status_code === 422) {
      throw new Error('Unscorable address. Not enough data to score.');
    }
    throw new Error('Failed to fetch from Cred API.');
  }

  // return { insights: { foo: 'bar' } };
  return {
    content: panel([
      heading('Cred Score Data'),
      text('Account Address:'),
      text(address),
      text('Cred Score:'),
      text(score.toString()),
    ]),
  };
};
