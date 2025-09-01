interface DebugPanelProps {
  data: unknown
}

export const DebugPanel = ({ data }: DebugPanelProps) => {
  return (
    <pre
      style={{
        padding: 12,
        marginTop: 12,
        background: '#0f172a',
        color: '#e2e8f0',
        borderRadius: 15,
        position: 'absolute',
        top: 72,
        left: 24,
        zIndex: -10,
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
