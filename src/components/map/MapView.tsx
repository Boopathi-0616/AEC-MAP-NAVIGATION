import React, { useRef, useState, useEffect } from 'react';
import { Coordinates, Place, Route, CampusEvent } from '../../types';
import { CAMPUS_PLACES } from '../../data/campusPlaces';

export interface MapViewProps {
  location?: Coordinates | null;
  destination?: Place | null;
  route?: Route | null;
  currentStepIndex?: number;
  zoomLevel?: number;
  selectedPlaceId?: string | null;
  onSelectPlace?: (place: Place) => void;
  isNavigating?: boolean;
  accuracy?: number | null;
  heading?: number | null;
  isTracking?: boolean;
  places?: Place[];
  isAdminMode?: boolean;
  onAdminMapClick?: (coords: Coordinates) => void;
  onAdminSelectPlace?: (place: Place) => void;
  activeEvents?: CampusEvent[];
}

export const MapView: React.FC<MapViewProps> = ({
  location,
  destination,
  route,
  currentStepIndex = 0,
  zoomLevel = 1,
  selectedPlaceId,
  onSelectPlace,
  isNavigating = false,
  accuracy = 12,
  heading = null,
  isTracking = false,
  places = CAMPUS_PLACES,
  isAdminMode = false,
  onAdminMapClick,
  onAdminSelectPlace,
  activeEvents = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

  // Pan to user location or destination when changed
  useEffect(() => {
    if (destination) {
      const destX = destination.coordinates.x;
      const destY = destination.coordinates.y;
      setPanOffset({
        x: (50 - destX) * 4.5,
        y: (50 - destY) * 4.5,
      });
    } else if (location) {
      setPanOffset({
        x: (50 - location.x) * 4.5,
        y: (50 - location.y) * 4.5,
      });
    }
  }, [destination?.id, location?.x, location?.y]);

  // Touch and mouse pan handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: dragStartRef.current.initialPanX + dx,
      y: dragStartRef.current.initialPanY + dy,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Admin Click Handler for adding or repositioning locations
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isAdminMode || !onAdminMapClick || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to 0-100 percentage coordinates
    const pctX = Math.round(Math.min(Math.max((clickX / rect.width) * 100, 5), 95));
    const pctY = Math.round(Math.min(Math.max((clickY / rect.height) * 100, 5), 95));

    // Project back to approximate GPS coordinates
    const lat = +(12.2305 - (pctY / 100) * (12.2305 - 12.2255)).toFixed(6);
    const lng = +(79.0715 + (pctX / 100) * (79.0775 - 79.0715)).toFixed(6);

    onAdminMapClick({
      x: pctX,
      y: pctY,
      lat,
      lng,
    });
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-full bg-[#FAF6EE] overflow-hidden select-none touch-none ${
        isAdminMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      } focus-visible:ring-2 focus-visible:ring-[#651C32] focus-visible:outline-none`}
      role="region"
      aria-label="Interactive Campus Map of Arunai Engineering College. Tab to navigate location markers, or arrow keys to pan."
      tabIndex={0}
      onKeyDown={(e) => {
        const step = 30;
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setPanOffset((prev) => ({ ...prev, y: prev.y + step }));
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setPanOffset((prev) => ({ ...prev, y: prev.y - step }));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setPanOffset((prev) => ({ ...prev, x: prev.x + step }));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setPanOffset((prev) => ({ ...prev, x: prev.x - step }));
        }
      }}
    >
      {/* Map Surface Render */}
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: '50% 50%',
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1000 1000"
          className="w-full h-full"
          style={{ minWidth: '100%', minHeight: '100%' }}
          role="img"
          aria-label="Vector Campus Map of Arunai Engineering College"
          onClick={handleSvgClick}
        >
          <defs>
            {/* Campus Lawn Texture Pattern */}
            <pattern id="lawnPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="#F4EDE0" />
              <circle cx="20" cy="20" r="1.5" fill="#E8DEC9" opacity="0.6" />
            </pattern>

            {/* Tree Top Pattern */}
            <radialGradient id="treeGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#8DA378" />
              <stop offset="100%" stopColor="#6B8255" />
            </radialGradient>

            {/* Premium Gold Elevation Gradient */}
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DFBF7B" />
              <stop offset="100%" stopColor="#C9A45C" />
            </linearGradient>
          </defs>

          {/* 1. Base Campus Ground & Lawns */}
          <rect width="1000" height="1000" fill="url(#lawnPattern)" />

          {/* Central Assembly Lawn Quadrangle */}
          <rect
            x="320"
            y="480"
            width="160"
            height="130"
            rx="20"
            fill="#E5DEC9"
            stroke="#D8CEBD"
            strokeWidth="1.5"
          />
          <text
            x="400"
            y="550"
            fontSize="10"
            fontWeight="600"
            fill="#8C7D81"
            textAnchor="middle"
            letterSpacing="1"
          >
            CENTRAL QUADRANGLE
          </text>

          {/* 2. Campus Roads & Walking Pathways */}
          <g stroke="#D8CEBD" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Main Entrance Gate 1 Corridor */}
            <path d="M 180 780 L 180 660 L 320 660 L 520 660 L 720 660" />
            {/* Central Avenue to Academic Block */}
            <path d="M 320 660 L 320 380 L 580 380 L 780 380" />
            {/* Technology Corridor */}
            <path d="M 440 380 L 440 260 L 760 260" />
            {/* North Ring Road */}
            <path d="M 180 660 L 180 480 L 240 480 L 240 260" />
            {/* East Amenities & Hostel Way */}
            <path d="M 640 660 L 640 540 L 780 540 L 780 260" />
          </g>

          {/* Inner Pedestrian Walking Paths */}
          <g stroke="#FFFDF8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M 180 780 L 180 660 L 320 660 L 520 660 L 720 660" />
            <path d="M 320 660 L 320 380 L 580 380 L 780 380" />
            <path d="M 440 380 L 440 260 L 760 260" />
            <path d="M 180 660 L 180 480 L 240 480 L 240 260" />
            <path d="M 640 660 L 640 540 L 780 540 L 780 260" />
          </g>

          {/* Campus Decorative Trees */}
          {[
            { cx: 140, cy: 720, r: 14 },
            { cx: 220, cy: 720, r: 12 },
            { cx: 260, cy: 600, r: 16 },
            { cx: 280, cy: 430, r: 13 },
            { cx: 360, cy: 330, r: 15 },
            { cx: 620, cy: 330, r: 14 },
            { cx: 720, cy: 330, r: 13 },
            { cx: 680, cy: 600, r: 16 },
            { cx: 500, cy: 590, r: 15 },
            { cx: 360, cy: 720, r: 14 },
            { cx: 580, cy: 720, r: 15 },
          ].map((tree, i) => (
            <circle key={i} cx={tree.cx} cy={tree.cy} r={tree.r} fill="url(#treeGrad)" opacity="0.85" />
          ))}

          {/* Main Entrance Gate Arch Landmark */}
          <g transform="translate(180, 780)">
            <rect x="-35" y="-12" width="70" height="24" rx="6" fill="#651C32" stroke="#C9A45C" strokeWidth="1.5" />
            <text x="0" y="4" fontSize="8" fontWeight="800" fill="#FFFDF8" textAnchor="middle" letterSpacing="0.8">
              GATE 1 (ENTRANCE)
            </text>
          </g>

          {/* 3. Interactive Building Footprints & Location Markers */}
          {places.map((place) => {
            const bx = place.coordinates.x * 10;
            const by = place.coordinates.y * 10;
            const isTarget = destination?.id === place.id;
            const isSelected = selectedPlaceId === place.id;

            // Compute open/closed and crowd colors
            const isOpen = place.status !== 'closed';
            const isMaintenance = place.status === 'maintenance';
            const isBusy = place.status === 'busy' || place.status === 'temporarily-closed';

            const crowdColor =
              place.crowdLevel === 'high'
                ? '#651C32'
                : place.crowdLevel === 'medium'
                ? '#C9A45C'
                : '#2FA66A';

            const activeEvent = activeEvents.find((e) => e.locationId === place.id);

            return (
              <g
                key={place.id}
                role="button"
                tabIndex={0}
                aria-label={`${place.name}. Located in ${place.building}. Status: ${place.status || 'open'}. Crowd: ${place.crowdLevel || 'low'}. Distance: ${place.distanceMeters}m.`}
                aria-pressed={isTarget || isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAdminMode && onAdminSelectPlace) {
                    onAdminSelectPlace(place);
                  } else {
                    onSelectPlace?.(place);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isAdminMode && onAdminSelectPlace) {
                      onAdminSelectPlace(place);
                    } else {
                      onSelectPlace?.(place);
                    }
                  }
                }}
                className="cursor-pointer group outline-none focus:outline-none"
              >
                <title>{`${place.name} · ${isOpen ? 'OPEN' : 'CLOSED'} · ${place.crowdLevel?.toUpperCase() || 'LOW'} CROWD`}</title>

                {/* Building Footprint Polygon with Clean Elevation */}
                <rect
                  x={bx - 46}
                  y={by - 26}
                  width="92"
                  height="52"
                  rx="12"
                  fill={
                    isTarget
                      ? '#651C32'
                      : isSelected
                      ? '#461323'
                      : !isOpen
                      ? '#EDE6D8'
                      : '#FFFDF8'
                  }
                  stroke={
                    isTarget
                      ? '#C9A45C'
                      : isSelected
                      ? '#C9A45C'
                      : !isOpen
                      ? '#C8BDB0'
                      : '#D8CEBD'
                  }
                  strokeWidth={isTarget || isSelected ? '3' : '1.5'}
                  filter="drop-shadow(0px 3px 6px rgba(70, 19, 35, 0.08))"
                  className="transition-all group-focus-visible:stroke-[#C9A45C] group-focus-visible:stroke-[3.5px]"
                />

                {/* High Crowd Gentle Pulse Ring on Marker */}
                {place.crowdLevel === 'high' && (
                  <circle cx={bx + 38} cy={by - 18} r="8" fill="#651C32" opacity="0.25">
                    <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Crowd Density & Status Pill in Top-Right Corner */}
                <g transform={`translate(${bx + 38}, ${by - 18})`}>
                  <circle cx="0" cy="0" r="4.5" fill={crowdColor} stroke="#FFFDF8" strokeWidth="1.2" />
                </g>

                {/* Status Dot in Top-Left Corner (Green = Open, Red/Muted = Closed) */}
                <g transform={`translate(${bx - 38}, ${by - 18})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r="3.5"
                    fill={
                      isOpen ? '#2FA66A' : isMaintenance ? '#D97706' : '#75666A'
                    }
                    stroke="#FFFDF8"
                    strokeWidth="1"
                  />
                </g>

                {/* Special Event Star Badge if Event is Active */}
                {activeEvent && (
                  <g transform={`translate(${bx}, ${by - 28})`}>
                    <rect x="-24" y="-8" width="48" height="13" rx="4" fill="#C9A45C" stroke="#461323" strokeWidth="1" />
                    <text x="0" y="2" fontSize="7" fontWeight="800" fill="#461323" textAnchor="middle">
                      EVENT
                    </text>
                  </g>
                )}

                {/* Building Name */}
                <text
                  x={bx}
                  y={by - 4}
                  fontSize="10"
                  fontWeight="700"
                  fill={isTarget || isSelected ? '#FFFDF8' : !isOpen ? '#75666A' : '#241B1E'}
                  textAnchor="middle"
                  letterSpacing="-0.1"
                  aria-hidden="true"
                >
                  {place.name.length > 15 ? place.name.slice(0, 13) + '…' : place.name}
                </text>

                {/* Building Subtitle + Status Pill */}
                <text
                  x={bx}
                  y={by + 11}
                  fontSize="8"
                  fontWeight="600"
                  fill={isTarget || isSelected ? '#E8DFD3' : !isOpen ? '#8C7D81' : '#75666A'}
                  textAnchor="middle"
                  aria-hidden="true"
                >
                  {!isOpen ? 'CLOSED' : place.crowdLevel === 'high' ? 'HIGH CROWD' : place.building.length > 17 ? place.building.slice(0, 15) + '…' : place.building}
                </text>
              </g>
            );
          })}

          {/* Active Navigation Route Line in Premium Maroon (#651C32) + Gold Nodes */}
          {route && route.waypoints.length > 1 && (
            <g
              role="img"
              aria-label={`Active walking route to ${route.destinationName}. Total distance ${route.totalDistanceMeters} metres.`}
            >
              <title>{`Route to ${route.destinationName}`}</title>
              {/* Route soft glow shadow */}
              <polyline
                points={route.waypoints.map((pt) => `${pt.x * 10},${pt.y * 10}`).join(' ')}
                fill="none"
                stroke="#C9A45C"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
              />
              {/* Primary Deep Maroon Route line */}
              <polyline
                points={route.waypoints.map((pt) => `${pt.x * 10},${pt.y * 10}`).join(' ')}
                fill="none"
                stroke="#651C32"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Inner dashed gold line for active navigation aesthetic */}
              <polyline
                points={route.waypoints.map((pt) => `${pt.x * 10},${pt.y * 10}`).join(' ')}
                fill="none"
                stroke="#C9A45C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 6"
              />

              {/* Waypoint circles */}
              {route.waypoints.map((wp, idx) => (
                <circle
                  key={idx}
                  cx={wp.x * 10}
                  cy={wp.y * 10}
                  r={idx === 0 || idx === route.waypoints.length - 1 ? 5 : 3.5}
                  fill="#FFFDF8"
                  stroke="#651C32"
                  strokeWidth="2.5"
                />
              ))}
            </g>
          )}

          {/* Premium User Location Marker (Glowing Maroon/Cream dot + pulse + heading arrow) */}
          {location && (
            <g
              transform={`translate(${location.x * 10}, ${location.y * 10})`}
              role="img"
              aria-label={`User live GPS position. Accuracy: ${accuracy} metres.`}
            >
              <title>Your Live Location</title>
              
              {/* Outer Accuracy Circle */}
              <circle
                cx="0"
                cy="0"
                r={Math.min(Math.max((accuracy || 12) * 1.5, 18), 45)}
                fill="#651C32"
                opacity="0.12"
                stroke="#C9A45C"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Glowing Pulse Ring */}
              <circle cx="0" cy="0" r="22" fill="#651C32" opacity="0.25">
                <animate
                  attributeName="r"
                  values="14;28;14"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.35;0.05;0.35"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Heading Indicator if heading is available */}
              {heading !== null && (
                <g transform={`rotate(${heading})`}>
                  <path
                    d="M 0 -18 L 6 -10 L -6 -10 Z"
                    fill="#C9A45C"
                    stroke="#461323"
                    strokeWidth="1"
                  />
                </g>
              )}

              {/* Core Maroon & Cream Location Dot */}
              <circle cx="0" cy="0" r="9" fill="#651C32" stroke="#FFFDF8" strokeWidth="3" />
              <circle cx="0" cy="0" r="4" fill="#C9A45C" />
            </g>
          )}

          {/* Destination Pin (Maroon & Gold Crown Pin) */}
          {destination && (
            <g
              transform={`translate(${destination.coordinates.x * 10}, ${destination.coordinates.y * 10 - 24})`}
              role="img"
              aria-label={`Target destination marker for ${destination.name}`}
            >
              <title>{`Destination: ${destination.name}`}</title>
              {/* Pin Drop Shadow */}
              <ellipse cx="0" cy="24" rx="7" ry="3.5" fill="#461323" opacity="0.3" />
              {/* Maroon Pin Body with Gold Trim */}
              <path
                d="M 0 0 C -12 -12 -12 -28 0 -28 C 12 -28 12 -12 0 0 Z"
                fill="#651C32"
                stroke="#C9A45C"
                strokeWidth="2"
              />
              <circle cx="0" cy="-18" r="4.5" fill="#FFFDF8" />
              <circle cx="0" cy="-18" r="2" fill="#651C32" />
            </g>
          )}
        </svg>
      </div>

      {/* Corporate Map Attribution Watermark */}
      <div className="absolute left-3.5 bottom-3.5 z-10 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FFFDF8]/85 backdrop-blur-md border border-[#E8DFD3]/80 text-[10px] font-semibold text-[#75666A] shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#651C32]"></span>
          <span>Arunai Engineering College</span>
          <span className="text-[#C9A45C]">·</span>
          <span>{isAdminMode ? 'Editor Mode Active' : 'Smart Campus Wayfinding'}</span>
        </div>
      </div>
    </div>
  );
};
