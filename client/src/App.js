import './App.css';
import {useBlockedServices} from "./useBlockedServices.js";

const BlockedWidget = ({isBlocked, loading, blockedServices, blockerType}) => {
  if (loading) {
    return (
      <div className="blocked-widget">
        <h1>Loading...</h1>
      </div>
    )
  }

  if (isBlocked) {
    return (
      <div className="blocked-widget">
        <h1>Currently blocking</h1>
        <p>Blocked by: {blockerType}</p>
        <h2>Blocked services</h2>
        <ul>
          {blockedServices.map(({name}) => <li key={name}>{name}</li>)}
        </ul>
      </div>
    )
  }

  return (
    <div className="blocked-widget not-blocked">
      <h1>Not currently blocking</h1>
    </div>
  )
}

function App() {
  const blockedServices = useBlockedServices()

  return (
    <div>
      <BlockedWidget
        loading={!blockedServices}
        isBlocked={blockedServices?.blocker}
        blockerType={blockedServices?.blocker?.type}
        blockedServices={blockedServices?.services}
      />
    </div>
  );
}

export default App;
