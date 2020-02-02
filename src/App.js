import React  from 'react';
import './App.css';
import { render } from 'react-dom';
import ApolloClient from 'apollo-boost';
import { gql } from "apollo-boost";
import { ApolloProvider } from '@apollo/react-hooks';
import { useQuery } from '@apollo/react-hooks';

const POLL_INTERVAL = 30000 // 30 seconds

const client = new ApolloClient({
  uri: 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql',
});

const HSL_QUERY = gql`
  query HSL_QUERY($id: String!) {
  stop(id: $id) {
    name
    stoptimesWithoutPatterns(numberOfDepartures: 10) {
      realtimeDeparture
      realtime
      realtimeState
      headsign
      trip {
        gtfsId
        route {
          shortName
        }
      }
    }
  }
}
`;

function Busses({stopID}) {
  const { loading, error, data } = 
      useQuery(HSL_QUERY, {
        variables: { id: stopID }, 
        pollInterval: POLL_INTERVAL,
      });

  if (loading) return <tr><td>Loading...</td></tr>
  if (error) return <tr><td>Errror</td></tr>

  return data.stop.stoptimesWithoutPatterns.map(({ headsign, realtimeDeparture, trip }, i) => (
    <tr key={trip.gtfsId} className={i %2 === 0 ? "grey": "white"}>
      <td>{new Date(realtimeDeparture * 1000).toISOString().substr(11, 8)}</td>       
      <td>{trip.route.shortName}</td>
      <td>{headsign}</td> 
    </tr>
  ));
};

function Stop({stopID}) {
  return(
  <table>
  <thead><tr><th>Aika</th><th>Linja</th><th>Määränpää</th></tr></thead>
  <tbody>
  <Busses stopID={stopID}/>
  </tbody>
  </table>
  )
}
  
const App = () => (
  <ApolloProvider client={client}>
    <div className="stop">Takomotie Länteen</div>
    <Stop stopID='HSL:1465103' />
    <div className="stop">Takomotie Itään</div>
    <Stop stopID='HSL:1465104' />
    <div className="footer">© Helsinki Region Transport {new Date().getFullYear()} under <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons BY 4.0 International</a></div>
  </ApolloProvider>
);

render(<App />, document.getElementById('root'));

export default App;
