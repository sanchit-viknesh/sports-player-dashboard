
import './Card.css'
import { usePlayerFields } from "./Hooks/usePlayerFields";

export const Card = ({ singlePlayer }) => {
  const preComputedFields = usePlayerFields(singlePlayer, {
    formatKey: (key) => key.replace(/([A-Z])/g, " $1").toUpperCase()
  })

  return (
    <div className="player-card-container">
      <div className="player-card">
        {preComputedFields.map(({ key, value }) => (
          <div key={key}>
            {key}: {String(value)}
          </div>
        ))}
      </div>
    </div>

  )

}