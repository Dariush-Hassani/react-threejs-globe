import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  createGlobe,
  initialCamera,
  initLights,
  initRings,
  mouseMove,
  raycastMouseDown,
  resize,
  yAxis,
} from "./Functions";

const Globe = () => {
  const globeCanvas = useRef();
  const [clickOnSphere, setClickOnSphere] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const meshes = useRef(new THREE.Object3D());
  const scene = useMemo(() => new THREE.Scene(), []);
  let aspectRatio =
    window.innerWidth >= window.innerHeight
      ? window.innerWidth / window.innerHeight
      : window.innerHeight / window.innerWidth;
  let frustumSize = 13;
  const camera = useMemo(
    () =>
      window.innerWidth >= window.innerHeight
        ? new THREE.OrthographicCamera(
            (frustumSize * aspectRatio) / -2,
            (frustumSize * aspectRatio) / 2,
            frustumSize / 2,
            frustumSize / -2,
            -100,
            100
          )
        : new THREE.OrthographicCamera(
            frustumSize / -2,
            frustumSize / 2,
            (frustumSize * aspectRatio) / 2,
            (-frustumSize * aspectRatio) / 2,
            -100,
            100
          ),
    []
  );
  const velocity = Math.PI / 30;
  const renderer = useMemo(() => new THREE.WebGLRenderer(), []);
  const render = () => renderer.render(scene, camera);
  const request = useRef();

  const mousedownEvent = (e) =>
    raycastMouseDown(e, camera, scene, setClickOnSphere, setStartPoint);
  const mouseUpEvent = () => {
    setClickOnSphere(false);
    setStartPoint({ x: 0, y: 0 });
  };
  const mouseMoveEvent = (e) => {
    mouseMove(e, clickOnSphere, startPoint, setStartPoint, meshes.current);
  };
  const resizeEvent = () => {
    resize(camera, renderer);
  };

  useEffect(() => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio * 1.5);
    globeCanvas.current.appendChild(renderer.domElement);

    initialCamera(camera);
    initLights(scene);
    createGlobe(scene, meshes.current, setLoading);
    initRings(scene);

    window.addEventListener("mousedown", mousedownEvent);
    window.addEventListener("touchstart", mousedownEvent);
    window.addEventListener("mouseup", mouseUpEvent);
    window.addEventListener("touchend", mouseUpEvent);
    window.addEventListener("resize", resizeEvent);
    return () => {
      cancelAnimationFrame(request.current);
      window.removeEventListener("mousedown", mousedownEvent);
      window.removeEventListener("touchstart", mousedownEvent);
      window.removeEventListener("mouseup", mouseUpEvent);
      window.removeEventListener("touchend", mouseUpEvent);
      window.removeEventListener("resize", resizeEvent);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", mouseMoveEvent);
    document.getElementById("globecanvas").addEventListener("touchmove", mouseMoveEvent);

    cancelAnimationFrame(request.current);
    let time = new Date().getTime();
    const animate = () => {
      request.current = requestAnimationFrame(animate);
      if (!clickOnSphere) {
        let dt = (new Date().getTime() - time) / 1000;
        time = new Date().getTime();
        meshes.current.rotateOnWorldAxis(yAxis, velocity * dt);
      }
      render();
    };
    request.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", mouseMoveEvent);
      document
        .getElementById("globecanvas")
        .removeEventListener("touchmove", mouseMoveEvent);
    };
  }, [startPoint, clickOnSphere]);

  return (
    <>
      {loading ? (
        <div id="loading">Texture Loading ...</div>
      ) : (
        <>
          <div id="drag">Drag on globe to rotate it</div>
          <div id="git">github.com/dariush-hassani</div>
        </>
      )}
      <div id="globecanvas" ref={globeCanvas}></div>
    </>
  );
};

export default Globe;
