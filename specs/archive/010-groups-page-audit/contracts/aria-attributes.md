# Contract: ARIA Attributes for Interactive Controls

Applies to: `ViewToggle.tsx`, `GroupBySelector.tsx`, `GroupCategoryTabs.tsx`, `TabNavigation.tsx`, `LevelSelector.tsx`, `GroupsHeader.tsx`

## ViewToggle

```tsx
<div role="group" aria-label="View mode">
  <button aria-pressed={value === 'table'} title="Table view">...</button>
  <button aria-pressed={value === 'cards'} title="Cards view">...</button>
</div>
```

## GroupBySelector

```tsx
<div role="tablist" aria-label="Group by">
  <button role="tab" aria-selected={isActive}>...</button>
</div>
```

## GroupCategoryTabs

```tsx
<div role="tablist" aria-label="Group categories">
  <button role="tab" aria-selected={cat.key === activeKey}>...</button>
</div>
```

## TabNavigation (Group Detail Page)

```tsx
<div role="tablist" aria-label="Group detail sections">
  <button role="tab" aria-selected={activeTab === tab.key} aria-controls={`panel-${tab.key}`}>...</button>
</div>
```

## LevelSelector

```tsx
<div role="group" aria-label="Level selector">
  <button aria-pressed={level.number === activeLevel}>...</button>
</div>
```

## Search Input (GroupsHeader)

```tsx
<input aria-label="Search groups" placeholder="Search groups..." />
```

## Material Symbols Icons

All `<span className="material-symbols-outlined">` elements MUST include `aria-hidden="true"`:

```tsx
<span className="material-symbols-outlined" aria-hidden="true">icon_name</span>
```
