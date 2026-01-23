import { Card } from "./Card"
export const CardList = ({ playerDetails }) => {
    return (
        <>
            {playerDetails.map((player => (
                <Card key={player.id}  singlePlayer={player}></Card>
            )))}
        </>
    )
}