import { precise2, lastSeenFmt } from '../../../shared/utils/utils';
import Link from 'next/link';
import {
  getOnlineIdentities,
  getOnlineIdentitiesCount,
} from '../../../shared/api';
import TooltipText from '../../../shared/components/tooltip';
import { SkeletonRows } from '../../../shared/components/skeleton';
import { useInfiniteQuery, useQuery } from 'react-query';
import { Fragment } from 'react';

const LIMIT = 30;

export default function Miners({ visible }) {
  const fetchIdentities = (_, skip = 0) => getOnlineIdentities(skip, LIMIT);

  const { data, fetchMore, canFetchMore, status } = useInfiniteQuery(
    visible && `identities`,
    fetchIdentities,
    {
      getFetchMore: (lastGroup, allGroups) => {
        return lastGroup && lastGroup.length === LIMIT
          ? allGroups.length * LIMIT
          : false;
      },
    }
  );

  const { data: identitiesCount } = useQuery(
    visible && 'identitiesCount',
    getOnlineIdentitiesCount
  );

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Address</th>
            <th>
              <TooltipText tooltip="The time of the latest block issued / vote for a block issued">
                Last seen
              </TooltipText>
            </th>
            <th style={{ width: 150 }}>Miner status</th>
            <th>
              <TooltipText tooltip="Mining penalty left">
                Penalty, DNA
              </TooltipText>
            </th>
          </tr>
        </thead>
        <tbody>
          {!visible ||
            (status === 'loading' && <SkeletonRows cols={4}></SkeletonRows>)}
          {data.map((page, i) => (
            <Fragment key={i}>
              {page &&
                page.map((item) => (
                  <tr key={item.address}>
                    <td>
                      <div className="user-pic">
                        <img
                          src={
                            'https://robohash.org/' + item.address.toLowerCase()
                          }
                          alt="pic"
                          width="32"
                        />
                      </div>
                      <div className="text_block text_block--ellipsis">
                        <Link
                          href="/identity/[address]"
                          as={`/identity/${item.address}`}
                        >
                          <a>{item.address}</a>
                        </Link>
                      </div>
                    </td>
                    <td>{lastSeenFmt(item.lastActivity)}</td>
                    <td>{item.online ? 'Mining' : 'Offline'}</td>
                    <td>{item.penalty === 0 ? '-' : precise2(item.penalty)}</td>
                  </tr>
                ))}
            </Fragment>
          ))}
        </tbody>
      </table>
      <div
        className="text-center"
        style={{ display: canFetchMore ? 'block' : 'none' }}
      >
        <button className="btn btn-small" onClick={() => fetchMore()}>
          Show more (
          {data.reduce((prev, cur) => prev + (cur ? cur.length : 0), 0)} of{' '}
          {identitiesCount})
        </button>
      </div>
    </div>
  );
}
