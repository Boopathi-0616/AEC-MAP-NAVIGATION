import { Coordinates, Place, Route } from '../types';

/**
 * MAP INTEGRATION CONTRACT
 * 
 * Your teammate can plug their map engine (Leaflet, Mapbox, Google Maps, or custom WebGL canvas)
 * directly into this adapter interface without altering the UI, navigation sheets, or AI Guide.
 */
export interface CampusMapAdapter {
  id: string;
  name: string;
  panTo: (coords: Coordinates) => void;
  setZoom: (level: number) => void;
  drawRoute: (route: Route | null) => void;
  highlightPlace: (place: Place | null) => void;
  destroy?: () => void;
}

class MapIntegrationManager {
  private activeAdapter: CampusMapAdapter | null = null;

  public registerAdapter(adapter: CampusMapAdapter) {
    this.activeAdapter = adapter;
    console.info(`[AEC Map Integration] Connected adapter: ${adapter.name}`);
  }

  public getAdapter(): CampusMapAdapter | null {
    return this.activeAdapter;
  }
}

export const mapIntegrationManager = new MapIntegrationManager();
