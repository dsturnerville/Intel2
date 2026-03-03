

## Rental Comps Analysis Page

### Overview
A new page at `/units/:id/rental-comps` accessible from the Unit Detail page. It provides a split list+map view of rental comps around the subject unit, with radius filtering and comp selection for median rent calculation. Built with mock data initially, designed for easy Spatial Laser API integration later.

### Page Structure

```text
┌─────────────────────────────────────────────────────┐
│ Header: ← Back | "Rental Comps - {address}" | Unit info summary
├─────────────────────────────────────────────────────┤
│ Filters Bar                                         │
│ [Radius: 0.5mi / 1mi / 2mi / 5mi] [Beds ▼] [Baths ▼] [Status ▼]
├──────────────────────┬──────────────────────────────┤
│  Comp List (left)    │  Map View (right)            │
│  ☐ 123 Main St       │  ● subject unit (distinct)   │
│    $1,450 | 3bd/2ba  │  ○ comp markers              │
│    0.3mi away        │  radius circle overlay        │
│  ☐ 456 Oak Ave       │                              │
│    $1,500 | 3bd/2ba  │                              │
│    0.8mi away        │                              │
│  ...                 │                              │
├──────────────────────┴──────────────────────────────┤
│ Summary Bar                                         │
│ Selected: 4 comps | Median Rent: $1,475 | Avg: $1,488│
│ Range: $1,350 - $1,600 | Suggested Rent: $1,475     │
└─────────────────────────────────────────────────────┘
```

### Implementation Plan

**1. Create mock rental comps data utility**
- `src/data/mockRentalComps.ts` with ~15 mock comps per unit, generating addresses, rents, bed/bath, sqft, lat/lng near the subject unit's coordinates, listing status (Active, Pending, Leased), days on market, and distance.

**2. Create the RentalComps page component**
- `src/pages/RentalComps.tsx` — fetches the subject unit by ID from the database, generates mock comps based on unit location.
- Split layout: scrollable comp list on left, Mapbox map on right (reusing existing Mapbox token pattern from `PropertyMap.tsx`).
- Filters: radius slider/select (0.25mi, 0.5mi, 1mi, 2mi, 5mi), bedroom/bathroom filters, listing status filter.
- Each comp row has a checkbox for selection. "Select All" / "Deselect All" controls.
- Summary bar at bottom calculates median, average, min, max rent from selected comps.

**3. Create the RentalCompsMap component**
- `src/components/rental-comps/RentalCompsMap.tsx` — Mapbox map showing the subject unit as a distinct marker (different color), comp markers as circles, and a radius circle overlay. Clicking a comp marker highlights it in the list. Hovering shows a popup with rent, beds, sqft.

**4. Create the RentalCompsList component**
- `src/components/rental-comps/RentalCompsList.tsx` — sortable table/list of comps with checkboxes, distance, rent, beds/baths, sqft, status, days on market.

**5. Create the RentalCompsSummary component**
- `src/components/rental-comps/RentalCompsSummary.tsx` — sticky bottom bar showing selected count, median/average/min/max rent, and a suggested rent recommendation.

**6. Add route and navigation**
- Add `/units/:id/rental-comps` route in `App.tsx` with `ProtectedRoute` + `AppLayout`.
- Add a "Rental Comps" button/link on the `UnitDetail.tsx` page header.

### Technical Details

- Mock data generator uses the subject unit's lat/lng to place comps within random distances, with realistic rent ranges based on the unit's `current_rent` field (±30%).
- Radius filtering uses Haversine distance calculation between subject unit and each comp.
- Median calculation: sort selected comp rents, take middle value(s).
- Map reuses existing Mapbox patterns (token from localStorage with default fallback, clustering disabled for this view, radius circle using `turf.circle` or manual GeoJSON polygon).
- The page is designed so mock data can be swapped for a `fetchComps(lat, lng, radius)` function that calls the Spatial Laser API via an edge function.

