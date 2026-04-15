import * as THREE from "three";
import type { ExplodeRule } from "./explode";

export const explodeRules: ExplodeRule[] = [
 {
    label: "Battery Module for Charging",
    matchNames: ["Battery Module for Charging"],
    direction: "bottom",
    distance: 0.01,
    rotation: new THREE.Euler(0, THREE.MathUtils.degToRad(-15), 0),
    rotationFirst: true,
    animationDurationMs: 900,
 },

 {
    label: "Casing for Battery",
    matchNames: ["Casing for Battery"],
    direction: "bottom",
    distance: 0.12,

    rotation: new THREE.Euler(0, THREE.MathUtils.degToRad(-30), 0),
    rotationFirst: true,
    animationDurationMs: 900,
 },

 {
    label: "Disposable Batteries",
    matchNames: ["Disposable Batteries"],
    direction: "bottom",
    distance: 0.01,

    rotation: new THREE.Euler(0, THREE.MathUtils.degToRad(-30), 0),
    rotationFirst: true,
    animationDurationMs: 900,
 },

  {
    label: "Connector group",
    matchNames: ["Connector"],
    direction: "right",
    distance: 0.01,
  },

  {
    label: "Cable",
    matchNames: ["Cable"],
    direction: "right",
    distance: 0.01,
  },

  {
    label: "Magnet",
    matchNames: ["Magnet"],

    direction: "right",
    distance: 0.01,

    secondDirection: "front",
    secondDistance: 0.01,

    animationDurationMs: 650,
  },

  {
    label: "Slimline",
    matchNames: ["Slimline", "Slim Line"],
    direction: "right",
    distance: 0.02,
  },

  {
    label: "Earhook",
    matchNames: ["Earhook", "Ear Hook"],

    direction: "bottom",
    distance: 0.02,

    offset: new THREE.Vector3(-0.04, 0, 0),

    animationDurationMs: 900,
  },

  {
    label: "Control button",
    matchNames: ["Control Button", "Button"],
    direction: "top",
    distance: 0.01,

    offset: new THREE.Vector3(0.01, 0, 0),
    animationDurationMs: 900,
  },

  {
    label: "Indicator light",
    matchNames: ["Indicator Light", "Light", "Indicator"],
    direction: "top",
    distance: 0.02,

    offset: new THREE.Vector3(0.015, 0, 0),
    animationDurationMs: 900,
  },

  {
    label: "Microphone 1",
    matchNames: ["Microphone 1", "Microphone1", "Mic 1"],
    direction: "top",
    distance: 0.02,

    offset: new THREE.Vector3(0.02, 0, 0),
    animationDurationMs: 900,
 },

 {
    label: "Microphone 2",
    matchNames: ["Microphone 2", "Microphone2", "Mic 2"],
    direction: "top",
    distance: 0.02,

    offset: new THREE.Vector3(0.025, 0, 0),
    animationDurationMs: 900,
 },

 {
    label: "Microphone cover",
    matchNames: ["Microphone Cover", "Mic Cover"],
    direction: "top",
    distance: 0.01,

    offset: new THREE.Vector3(0.012, 0, 0),
    animationDurationMs: 900,
},
];