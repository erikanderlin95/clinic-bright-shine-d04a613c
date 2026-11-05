/** Existing schema has no clinic mapping, queue endpoint, or attributed CMS feed.
 * These gates must remain false until those capabilities are verified together.
 * Do not substitute the global appointments table or browser-local queue state.
 */
export interface PortalCapabilities {
  clinicMapped: boolean;
  persistentQueue: boolean;
  manualClosureProtected: boolean;
  attributedCmsRecords: boolean;
}

export const existingPortalCapabilities: Readonly<PortalCapabilities> = Object.freeze({
  clinicMapped: false,
  persistentQueue: false,
  manualClosureProtected: false,
  attributedCmsRecords: false,
});

export function canControlQueue(capabilities: PortalCapabilities): boolean {
  return capabilities.clinicMapped && capabilities.persistentQueue && capabilities.manualClosureProtected;
}

export function canReadCmsRecords(capabilities: PortalCapabilities): boolean {
  return capabilities.clinicMapped && capabilities.attributedCmsRecords;
}