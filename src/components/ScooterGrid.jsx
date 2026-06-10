import ScooterCard from './ScooterCard'

export default function ScooterGrid({ scooters }) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}
    >
      {scooters.map(s => <ScooterCard key={s.id} scooter={s} />)}
    </div>
  )
}
