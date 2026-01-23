import './App.css'
import { CardList } from './Practice/CardList';
import footballPlayerDetails from './jsons/FootballPlayers.json'
import cricketPlayerDetails from './jsons/CricletPlayers.json'
import { useMemo, useState } from 'react';

function App() {
  const [selectSport, setSport] = useState("Football");
  const [selectCricketFormat, setCricketFormat] = useState(null); // T20,ODI,Tes
  const [footballState, setFootballState] = useState(
    {
      dropDown: {
        clubOrCountry: null,
        selectedOption: ""
      }
    }
  );
  const filterFootballPlayers = (clubOrCountry, optionSelected) => {
    if (!optionSelected) return footballPlayerDetails;
    let playersIntheClub = footballState.playerDetails;
    if (clubOrCountry === "Club") {
      playersIntheClub = footballPlayerDetails.filter(filteredVal => (
        filteredVal.clubs.includes(optionSelected)
      ));
      return playersIntheClub;
    } else if (clubOrCountry === "Country") {
      playersIntheClub = footballPlayerDetails.filter(filteredVal => (
        filteredVal.country === optionSelected
      ));
      return playersIntheClub;
    }
  }
  const filterCricketPlayersBasedOnFormat = (format) => {
    if (!format) return cricketPlayerDetails;
    return cricketPlayerDetails.filter(cricPlayer => cricPlayer.format === format);
  }

  const loadPlayerDetails = useMemo(() => {
    if (selectSport === "Cricket") {
      if (!selectCricketFormat) {
        return cricketPlayerDetails;
      }
      return filterCricketPlayersBasedOnFormat(selectCricketFormat)
    }
    if (selectSport === "Football") {
      if (!footballState.dropDown.selectedOption) {
        return footballPlayerDetails;
      }
      if (footballState.dropDown.clubOrCountry === "Club") {
        return filterFootballPlayers(footballState.dropDown.clubOrCountry, footballState.dropDown.selectedOption);
      } else if (footballState.dropDown.clubOrCountry === "Country") {
        return filterFootballPlayers(footballState.dropDown.clubOrCountry, footballState.dropDown.selectedOption);
      }
    }
    return selectSport === "Football" ? footballPlayerDetails : cricketPlayerDetails
  }, [selectSport, selectCricketFormat, footballState.dropDown.clubOrCountry, footballState.dropDown.selectedOption]);

  const dropDownOptions = useMemo(() => {
    let dropDownValues = new Set();
    if (footballState.dropDown.clubOrCountry === "Club") {
      footballPlayerDetails.map(fpd => {
        fpd.clubs.map(fpdClubVal => {
          dropDownValues.add(fpdClubVal);
        })
      });
    } else {
      footballPlayerDetails.map(fpd => dropDownValues.add(fpd.country));
    }
    return Array.from(dropDownValues);
  }, [footballState.dropDown.clubOrCountry]);

  const handleDropDownChange = (optionSelected) => {
    setFootballState(previous => ({
      dropDown: {
        ...previous.dropDown,
        selectedOption: optionSelected
      }
    }));
  }

  return (
    <>
      <CardList playerDetails={loadPlayerDetails} />
      <button onClick={() => setSport("Football")}>Show Football Players</button>
      <button onClick={() => setSport("Cricket")}>Show Cricket Players</button>
      {
        selectSport === "Football" ? <div className="game-speci fic-button-container">
          <button onClick={() => setFootballState(prev => ({ ...prev, dropDown: { clubOrCountry: 'Country' } }))}>Country Wise</button>
          <button onClick={() => setFootballState(prev => ({ ...prev, dropDown: { clubOrCountry: 'Club' } }))}>Club Wise</button></div> :
          <div className="game-specific-button-container">
            <button onClick={() => setCricketFormat("Test")}>Test Cricket</button>
            <button onClick={() => setCricketFormat("ODI")}>ODI</button>
            <button onClick={() => setCricketFormat("T20")}>T20</button></div>
      }
      {
        selectSport === "Football" && dropDownOptions && <div>
          <select value={footballState.dropDown.selectedOption} onChange={(event) => handleDropDownChange(event.target.value)}>
            {
              dropDownOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))
            }
          </select>
        </div>
      }
    </>)
}

export default App;