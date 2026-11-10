import { ChainAdapter } from './adapter';
import { MockChainAdapter } from './mock';
import { NearChainAdapter } from './near';

const mockAdapter = new MockChainAdapter();
const nearAdapter = new NearChainAdapter();

export function isLiveChainMode(): boolean {
  return process.env.CHAIN_MODE === 'live';
}

export function getChainAdapter(): ChainAdapter {
  if (isLiveChainMode()) {
    return nearAdapter;
  }
  return mockAdapter;
}

export { mockAdapter, nearAdapter };
export * from './adapter';
