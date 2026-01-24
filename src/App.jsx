import './App.css'
import { CardList } from './Practice/CardList';
import footballPlayerDetails from './jsons/FootballPlayers.json'
import cricketPlayerDetails from './jsons/CricletPlayers.json'
import { useMemo, useState } from 'react';
import { useFilteredPlayers } from './Practice/Hooks/useFilteredPlayers';

function App() {
  const [selectSport, setSport] = useState("Football");
  const [selectCricketFormat, setCricketFormat] = useState(null); // T20,ODI,Test
  const [footballFilterType, setFootballFilterType] = useState("Country"); // Club, Country
  const [selectedDropdownOption, setSelectedDropdownOption] = useState(''); // Any one of the options in dropdown of Club, Country

  const players = selectSport === "Football" ? footballPlayerDetails : cricketPlayerDetails;

  const loadPlayerDetails = useFilteredPlayers({
    selectSport: selectSport,
    players: players,
    selectCricketFormat: selectCricketFormat,
    footballFilterType: footballFilterType,
    selectedDropdownOption: selectedDropdownOption
  });

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
    setSelectedDropdownOption('');
    setFootballFilterType(clubOrCountry);
  }

  return (
    <>
      <CardList playerDetails={loadPlayerDetails} />
      <button onClick={() => setSport("Football")}>Show Football Players</button>
      <button onClick={() => setSport("Cricket")}>Show Cricket Players</button>
      {
        selectSport === "Football" ? <div className="game-specific-button-container">
          <button onClick={() => handleFilterTypeChange('Country')}>Country Wise</button>
          <button onClick={() => handleFilterTypeChange('Club')}>Club Wise</button></div> :
          <div className="game-specific-button-container">
            <button onClick={() => setCricketFormat("Test")}>Test Cricket</button>
            <button onClick={() => setCricketFormat("ODI")}>ODI</button>
            <button onClick={() => setCricketFormat("T20")}>T20</button></div>
      }
      {
        selectSport === "Football" && dropDownOptions && <div>
          <select key={selectedDropdownOption} value={selectedDropdownOption} onChange={(event) => handleDropDownChange(event.target.value)}>
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