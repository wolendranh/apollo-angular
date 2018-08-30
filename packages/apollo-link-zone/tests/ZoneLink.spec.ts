
import 'zone.js/dist/zone-node';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';
import 'jest-zone-patch';
import {execute} from 'apollo-link';

import {ZoneLink} from '../src/ZoneLink';
import {withMock} from './_mockLink';

window['Zone'] = {
  current: {
    run: (fn: Function) => {
      console.log('Running true Zone');
      fn();
    },
  },
};

describe('ZoneLink', () => {
  let spyZone: jest.Mock;

  beforeEach(() => {
    spyZone = jest
      .spyOn(Zone.current, 'run')
      .mockImplementation((fn: Function) => fn());
  });

  afterEach(() => {
    (spyZone as any).mockRestore();
  });

  test('run Execution Link inside a Zone', (done: jest.DoneCallback) => {
    const op1 = {
      operationName: 'op1',
      result: {
        data: {
          foo: 'foo1',
        },
      },
    };

    const zoneLink = new ZoneLink();
    const mockLink = withMock([op1]);

    const link = zoneLink.concat(mockLink);

    try {
      execute(link, {
        operationName: 'op1',
        query: 'op1-query' as any,
      }).subscribe({
        next: () => {
          expect(spyZone.mock.calls.length).toEqual(1);
          done();
        },
        error: err => {
          done.fail(err);
        },
      });
    } catch (e) {
      done.fail(e);
    }
  });
  test('should respect zoneHandler', (done: jest.DoneCallback) => {
    const op1 = {
      operationName: 'op1',
      result: {
        data: {
          foo: 'foo1',
        },
      },
    };

    const zoneLink = new ZoneLink(() => false);
    const mockLink = withMock([op1]);

    const link = zoneLink.concat(mockLink);

    try {
      execute(link, {
        operationName: 'op1',
        query: 'op1-query' as any,
      }).subscribe({
        next: () => {
          expect(spyZone.mock.calls.length).toEqual(0);
          done();
        },
        error: err => {
          done.fail(err);
        },
      });
    } catch (e) {
      done.fail(e);
    }
  });
});
