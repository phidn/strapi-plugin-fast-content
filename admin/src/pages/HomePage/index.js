import React, { memo, useState, useRef, useEffect } from "react";
import { HeaderLayout } from "@strapi/design-system/Layout";
import { Box } from "@strapi/design-system/Box";
import {
  Tabs,
  Tab,
  TabGroup,
  TabPanels,
  TabPanel,
} from "@strapi/design-system/Tabs";
import { Checkbox } from '@strapi/design-system/Checkbox';
import GenerateContentType from "../../components/GenerateContentType";
import ImportContents from "../../components/ImportContents";
import {
  Accordion,
  AccordionToggle,
  AccordionContent,
  AccordionGroup,
} from "@strapi/design-system/Accordion";
import { Flex } from '@strapi/design-system/Flex';
import MonacoEditor from "@monaco-editor/react";
import Write from "@strapi/icons/Write";
import Alien from "@strapi/icons/Alien";
import Magic from "@strapi/icons/Magic";
import { Button } from "@strapi/design-system/Button";
import pluginId from "../../pluginId";
import { SAMPLE_DATA } from "./sample";
import { useNotification } from "@strapi/helper-plugin";

const HomePage = () => {
  const toggleNotification = useNotification();

  const [expanded, setExpanded] = useState(true);
  const [tabIndex, setTabIndex] = useState(-1);
  const [sampleData, setSampleData] = useState(SAMPLE_DATA);
  const [isExistValidData, setIsExistValidData] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false)
  const generateRef = useRef();
  
  const importRef = useRef();
  const [loadingImport, setLoadingImport] = useState(false)

  useEffect(() => {
    if (expanded) {
      setTabIndex(-1)
      setIsExistValidData(false)
    }
  }, [expanded])
  

  const changeSampleData = (value) => {
    setSampleData(JSON.parse(value));
  };

  const analyzeSampleData = () => {
    if (!_.isArray(sampleData)) {
      toggleNotification({
        type: "warning",
        message: "Your sample data must be an array",
      });
      return;
    }
    if (_.isEmpty(sampleData) || _.isEmpty(sampleData[0])) {
      toggleNotification({
        type: "warning",
        message: "Your sample data must be a non-empty array",
      });
      return;
    }
    setIsExistValidData(true)
    setExpanded(false)
    setTabIndex(0)
  };

  const renderPrimaryAction = () => {
    switch (tabIndex) {
      case -1:
        return (
          <Button
            startIcon={<Alien />}
            disabled={false}
            onClick={analyzeSampleData}
          >
            Analyze
          </Button>
        );
      case 0:
        return (
          <Button
            startIcon={<Write />}
            disabled={false}
            loading={loadingGenerate}
            onClick={() => generateRef.current.submit()}
          >
            Generate
          </Button>
        );
      case 1:
        return (
          <Button
            startIcon={<Magic />}
            disabled={false}
            loading={loadingImport}
            onClick={() => importRef.current.submit()}
          >
            Import
          </Button>
        );
      default:
        return <></>;
    }
  };

  return (
    <div style={{ display: "grid" }}>
      <div style={{ overflow: "hidden" }}>
        <Box background="neutral100">
          <HeaderLayout
            title="Fast Content Builder"
            subtitle="Fast Content Builder plugin provides a fast way to transfer your data to Strapi Collection."
            primaryAction={renderPrimaryAction()}
          />
          <Box padding={10} paddingTop={0}>
            <Accordion
              expanded={expanded}
              onToggle={() => setExpanded((s) => !s)}
              id="acc-1"
              size="S"
            >
              <AccordionToggle title={
                <Flex>
                  <Box paddingRight={2}>Your sample data</Box>
                  {isExistValidData && <Checkbox checked></Checkbox>}
                </Flex>
              } />
              <AccordionContent>
                <Box padding={5}>
                  <MonacoEditor
                    height="50vh"
                    theme="vs-dark"
                    language="json"
                    options={{
                      readOnly: false,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                    }}
                    value={JSON.stringify(sampleData, null, 2)}
                    onChange={changeSampleData}
                  />
                </Box>
              </AccordionContent>
            </Accordion>
          </Box>
          {isExistValidData && (
            <Box padding={10} paddingTop={0}>
              <TabGroup
                label="Fast Content Tabs"
                id="tabs"
                initialSelectedTabIndex={tabIndex}
                onTabChange={setTabIndex}
              >
                <Tabs>
                  <Tab>Generate Content-Type</Tab>
                  <Tab>Import Contents</Tab>
                </Tabs>
                <TabPanels>
                  <TabPanel>
                    <GenerateContentType
                      sampleData={sampleData}
                      setLoadingGenerate={setLoadingGenerate}
                      ref={generateRef}
                    />
                  </TabPanel>
                  <TabPanel>
                    <ImportContents 
                      sampleData={sampleData}
                      ref={importRef} 
                      setLoadingImport={setLoadingImport}
                    />
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </Box>
          )}
        </Box>
      </div>
    </div>
  );
};

export default memo(HomePage);
