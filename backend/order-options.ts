export function resolveOrderOptionLabels(selections: { groupId: string; id: string }[], options: { id: string; name: string }[]) {
  return selections.map((selection) => options.find((option) => option.id.endsWith(`:${selection.groupId}:${selection.id}`))?.name ?? selection.id)
}
