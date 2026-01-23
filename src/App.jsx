import './App.css'
import { CardList } from './Practice/CardList';
import footballPlayerDetails from './jsons/FootballPlayers.json'
import cricketPlayerDetails from './jsons/CricletPlayers.json'
import { useMemo, useState } from 'react';

function App() {
  const [selectSport, setSport] = useState("Football");
  const [selectCricketFormat, setCricketFormat] = useState(null); // T20,ODI,Test
  const [footballFilterType, setFootballFilterType] = useState("Country"); // Club, Country
  const [selectedDropdownOption, setSelectedDropdownOption] = useState(null); // Any one of the options in dropdown of Club, Country
  
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
  const players = selectSport === "Football" ? footballPlayerDetails : cricketPlayerDetails;

  const loadPlayerDetails = useMemo(() => {
    if (selectSport === "Cricket") {
      if (!selectCricketFormat) {
        return cricketPlayerDetails;
      }
      return filterCricketPlayersBasedOnFormat(selectCricketFormat)
    }
    if (selectSport === "Football") {
      if (!selectedDropdownOption) {
        return footballPlayerDetails;
      }
      if (footballFilterType === "Club") {
        return filterFootballPlayers(footballFilterType, selectedDropdownOption);
      } else if (footballFilterType === "Country") {
        return filterFootballPlayers(footballFilterType, selectedDropdownOption);
      }
    }
    return players;
  }, [selectSport, selectCricketFormat, footballFilterType, selectedDropdownOption]);

  const dropDownOptions = useMemo(() => {
    let dropDownValues = new Set();
    if (footballFilterType === "Club") {
      footballPlayerDetails.map(fpd => {
        fpd.clubs.map(fpdClubVal => {
          dropDownValues.add(fpdClubVal);
        })
      });
    } else {
      footballPlayerDetails.map(fpd => dropDownValues.add(fpd.country));
    }
    return Array.from(dropDownValues);
  }, [footballFilterType]);

  const handleDropDownChange = (optionSelected) => {
    setSelectedDropdownOption(optionSelected);
  }
  const handleFilterTypeChange = (clubOrCountry) => {
    setFootballFilterType(clubOrCountry);
    setSelectedDropdownOption('');
  }

  return (
    <>
      <CardList playerDetails={loadPlayerDetails} />
      <button onClick={() => setSport("Football")}>Show Football Players</button>
      <button onClick={() => setSport("Cricket")}>Show Cricket Players</button>
      {
        selectSport === "Football" ? <div className="game-speci fic-button-container">
          <button onClick={() => handleFilterTypeChange('Country')}>Country Wise</button>
          <button onClick={() => handleFilterTypeChange('Club')}>Club Wise</button></div> :
          <div className="game-specific-button-container">
            <button onClick={() => setCricketFormat("Test")}>Test Cricket</button>
            <button onClick={() => setCricketFormat("ODI")}>ODI</button>
            <button onClick={() => setCricketFormat("T20")}>T20</button></div>
      }
      {
        selectSport === "Football" && dropDownOptions && <div>
          <select  key={selectedDropdownOption} value={selectedDropdownOption} onChange={(event) => handleDropDownChange(event.target.value)}>
            <option value="" disabled>Select {footballFilterType === 'Club' ? 'a Club' : 'a Country'}</option>
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