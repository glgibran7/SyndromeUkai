// src/utils/NavigationService.js
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function resetTo(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name, params }],
    });
  }
}
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}
export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
}
export function isReady() {
  return navigationRef.isReady();
}
export function canGoBack() {
  return navigationRef.isReady() && navigationRef.canGoBack();
}
export function getRootState() {
  if (navigationRef.isReady()) {
    return navigationRef.getRootState();
  }
  return null;
}
export function dispatch(action) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(action);
  }
}
export function setParams(params) {
  if (navigationRef.isReady()) {
    navigationRef.setParams(params);
  }
}
export function getCurrentOptions() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentOptions();
  }
  return null;
}
export function addListener(eventName, callback) {
  if (navigationRef.isReady()) {
    return navigationRef.addListener(eventName, callback);
  }
  return null;
}
export function removeListener(eventName, callback) {
  if (navigationRef.isReady()) {
    navigationRef.removeListener(eventName, callback);
  }
}
