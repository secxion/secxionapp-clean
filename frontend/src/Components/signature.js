import { motion } from "framer-motion";

const SXNSignature = () => {
  return (
    <>
      <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, type: "spring" }}
                        className="flex flex-col items-center w-full"
                        style={{ zIndex: 2 }}
                      >
                        <motion.h1
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="font-extrabold text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient-move"
                          style={{
                            letterSpacing: "0.15em",
                            fontFamily: "monospace",
                            userSelect: "none",
                          }}
                        >
                          SXN
                        </motion.h1>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ delay: 0.4, duration: 0.6 }}
                          className="h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full w-full"
                        ></motion.div>
                      </motion.div></>
    )}
    
    export default SXNSignature;