/* eslint-disable */
//Calculate CVSS v3.1

var CVSS = {};

CVSS.CVSSVersionIdentifier = "CVSS:3.1";
CVSS.exploitabilityCoefficient = 8.22;
CVSS.scopeCoefficient = 1.08;

// A regular expression to validate that a CVSS 3.0 vector string is well formed. It checks metrics and metric
// values. It does not check that a metric is specified more than once and it does not check that all base
// metrics are present. These checks need to be performed separately.

CVSS.vectorStringRegex_30 = /^CVSS:3\.1\/((AV:[NALP]|AC:[LH]|PR:[UNLH]|UI:[NR]|S:[UC]|[CIA]:[NLH]|E:[XUPFH]|RL:[XOTWU]|RC:[XURC]|[CIA]R:[XLMH]|MAV:[XNALP]|MAC:[XLH]|MPR:[XUNLH]|MUI:[XNR]|MS:[XUC]|M[CIA]:[XNLH])\/)*(AV:[NALP]|AC:[LH]|PR:[UNLH]|UI:[NR]|S:[UC]|[CIA]:[NLH]|E:[XUPFH]|RL:[XOTWU]|RC:[XURC]|[CIA]R:[XLMH]|MAV:[XNALP]|MAC:[XLH]|MPR:[XUNLH]|MUI:[XNR]|MS:[XUC]|M[CIA]:[XNLH])$/;


// Associative arrays mapping each metric value to the constant defined in the CVSS scoring formula in the CVSS v3.0
// specification.

CVSS.Weight = {
  AV:   { N: 0.85,  A: 0.62,  L: 0.55,  P: 0.2},
  AC:   { H: 0.44,  L: 0.77},
  PR:   { U:       {N: 0.85,  L: 0.62,  H: 0.27},         // These values are used if Scope is Unchanged
          C:       {N: 0.85,  L: 0.68,  H: 0.5}},         // These values are used if Scope is Changed
  UI:   { N: 0.85,  R: 0.62},
  S:    { U: 6.42,  C: 7.52},                             // Note: not defined as constants in specification
  CIA:  { N: 0,     L: 0.22,  H: 0.56},                   // C, I and A have the same weights

  E:    { X: 1,     U: 0.91,  P: 0.94,  F: 0.97,  H: 1},
  RL:   { X: 1,     O: 0.95,  T: 0.96,  W: 0.97,  U: 1},
  RC:   { X: 1,     U: 0.92,  R: 0.96,  C: 1},

  CIAR: { X: 1,     L: 0.5,   M: 1,     H: 1.5}           // CR, IR and AR have the same weights
};


// Severity rating bands, as defined in the CVSS v3.0 specification.

CVSS.severityRatings  = [ { name: "None",     bottom: 0.0, top:  0.0},
                          { name: "Low",      bottom: 0.1, top:  3.9},
                          { name: "Medium",   bottom: 4.0, top:  6.9},
                          { name: "High",     bottom: 7.0, top:  8.9},
                          { name: "Critical", bottom: 9.0, top: 10.0} ];




/* ** CVSS.calculateCVSSFromMetrics **
 *
 * Takes Base, Temporal and Environmental metric values as individual parameters. Their values are in the short format
 * defined in the CVSS v3.0 standard definition of the Vector String. For example, the AttackComplexity parameter
 * should be either "H" or "L".
 *
 * Returns Base, Temporal and Environmental scores, severity ratings, and an overall Vector String. All Base metrics
 * are required to generate this output. All Temporal and Environmental metric values are optional. Any that are not
 * passed default to "X" ("Not Defined").
 *
 * The output is an object which always has a property named "success".
 *
 * If no errors are encountered, success is Boolean "true", and the following other properties are defined containing
 * scores, severities and a vector string:
 *   baseMetricScore, baseSeverity,
 *   temporalMetricScore, temporalSeverity,
 *   environmentalMetricScore, environmentalSeverity,
 *   vectorString
 *
 * If errors are encountered, success is Boolean "false", and the following other properties are defined:
 *   errorType - a string indicating the error. Either:
 *                 "MissingBaseMetric", if at least one Base metric has not been defined; or
 *                 "UnknownMetricValue", if at least one metric value is invalid.
 *   errorMetrics - an array of strings representing the metrics at fault. The strings are abbreviated versions of the
 *                  metrics, as defined in the CVSS v3.0 standard definition of the Vector String.
 */
CVSS.calculateCVSSFromMetrics = function (
  AttackVector, AttackComplexity, PrivilegesRequired, UserInteraction, Scope, Confidentiality, Integrity, Availability,
  ExploitCodeMaturity, RemediationLevel, ReportConfidence,
  ConfidentialityRequirement, IntegrityRequirement, AvailabilityRequirement,
  ModifiedAttackVector, ModifiedAttackComplexity, ModifiedPrivilegesRequired, ModifiedUserInteraction, ModifiedScope,
  ModifiedConfidentiality, ModifiedIntegrity, ModifiedAvailability) {

  // If input validation fails, this array is populated with strings indicating which metrics failed validation.
  var badMetrics = [];

  // ENSURE ALL BASE METRICS ARE DEFINED
  //
  // We need values for all Base Score metrics to calculate scores.
  // If any Base Score parameters are undefined, create an array of missing metrics and return it with an error.

  if (typeof AttackVector       === "undefined" || AttackVector       === "") { badMetrics.push("AV"); }
  if (typeof AttackComplexity   === "undefined" || AttackComplexity   === "") { badMetrics.push("AC"); }
  if (typeof PrivilegesRequired === "undefined" || PrivilegesRequired === "") { badMetrics.push("PR"); }
  if (typeof UserInteraction    === "undefined" || UserInteraction    === "") { badMetrics.push("UI"); }
  if (typeof Scope              === "undefined" || Scope              === "") { badMetrics.push("S");  }
  if (typeof Confidentiality    === "undefined" || Confidentiality    === "") { badMetrics.push("C");  }
  if (typeof Integrity          === "undefined" || Integrity          === "") { badMetrics.push("I");  }
  if (typeof Availability       === "undefined" || Availability       === "") { badMetrics.push("A");  }

  if (badMetrics.length > 0) {
    return { success: false, errorType: "MissingBaseMetric", errorMetrics: badMetrics };
  }


  // STORE THE METRIC VALUES THAT WERE PASSED AS PARAMETERS
  //
  // Temporal and Environmental metrics are optional, so set them to "X" ("Not Defined") if no value was passed.

  var AV = AttackVector;
  var AC = AttackComplexity;
  var PR = PrivilegesRequired;
  var UI = UserInteraction;
  var S  = Scope;
  var C  = Confidentiality;
  var I  = Integrity;
  var A  = Availability;

  var E =   ExploitCodeMaturity || "X";
  var RL =  RemediationLevel    || "X";
  var RC =  ReportConfidence    || "X";

  var CR =  ConfidentialityRequirement || "X";
  var IR =  IntegrityRequirement       || "X";
  var AR =  AvailabilityRequirement    || "X";
  var MAV = ModifiedAttackVector       || "X";
  var MAC = ModifiedAttackComplexity   || "X";
  var MPR = ModifiedPrivilegesRequired || "X";
  var MUI = ModifiedUserInteraction    || "X";
  var MS =  ModifiedScope              || "X";
  var MC =  ModifiedConfidentiality    || "X";
  var MI =  ModifiedIntegrity          || "X";
  var MA =  ModifiedAvailability       || "X";


  // CHECK VALIDITY OF METRIC VALUES
  //
  // Use the Weight object to ensure that, for every metric, the metric value passed is valid.
  // If any invalid values are found, create an array of their metrics and return it with an error.
  //
  // The Privileges Required (PR) weight depends on Scope, but when checking the validity of PR we must not assume
  // that the given value for Scope is valid. We therefore always look at the weights for Unchanged Scope when
  // performing this check. The same applies for validation of Modified Privileges Required (MPR).
  //
  // The Weights object does not contain "X" ("Not Defined") values for Environmental metrics because we replace them
  // with their Base metric equivalents later in the function. For example, an MAV of "X" will be replaced with the
  // value given for AV. We therefore need to explicitly allow a value of "X" for Environmental metrics.

  if (!CVSS.Weight.AV.hasOwnProperty(AV))   { badMetrics.push("AV"); }
  if (!CVSS.Weight.AC.hasOwnProperty(AC))   { badMetrics.push("AC"); }
  if (!CVSS.Weight.PR.U.hasOwnProperty(PR)) { badMetrics.push("PR"); }
  if (!CVSS.Weight.UI.hasOwnProperty(UI))   { badMetrics.push("UI"); }
  if (!CVSS.Weight.S.hasOwnProperty(S))     { badMetrics.push("S"); }
  if (!CVSS.Weight.CIA.hasOwnProperty(C))   { badMetrics.push("C"); }
  if (!CVSS.Weight.CIA.hasOwnProperty(I))   { badMetrics.push("I"); }
  if (!CVSS.Weight.CIA.hasOwnProperty(A))   { badMetrics.push("A"); }

  if (!CVSS.Weight.E.hasOwnProperty(E))     { badMetrics.push("E"); }
  if (!CVSS.Weight.RL.hasOwnProperty(RL))   { badMetrics.push("RL"); }
  if (!CVSS.Weight.RC.hasOwnProperty(RC))   { badMetrics.push("RC"); }

  if (!(CR  === "X" || CVSS.Weight.CIAR.hasOwnProperty(CR)))  { badMetrics.push("CR"); }
  if (!(IR  === "X" || CVSS.Weight.CIAR.hasOwnProperty(IR)))  { badMetrics.push("IR"); }
  if (!(AR  === "X" || CVSS.Weight.CIAR.hasOwnProperty(AR)))  { badMetrics.push("AR"); }
  if (!(MAV === "X" || CVSS.Weight.AV.hasOwnProperty(MAV)))   { badMetrics.push("MAV"); }
  if (!(MAC === "X" || CVSS.Weight.AC.hasOwnProperty(MAC)))   { badMetrics.push("MAC"); }
  if (!(MPR === "X" || CVSS.Weight.PR.U.hasOwnProperty(MPR))) { badMetrics.push("MPR"); }
  if (!(MUI === "X" || CVSS.Weight.UI.hasOwnProperty(MUI)))   { badMetrics.push("MUI"); }
  if (!(MS  === "X" || CVSS.Weight.S.hasOwnProperty(MS)))     { badMetrics.push("MS"); }
  if (!(MC  === "X" || CVSS.Weight.CIA.hasOwnProperty(MC)))   { badMetrics.push("MC"); }
  if (!(MI  === "X" || CVSS.Weight.CIA.hasOwnProperty(MI)))   { badMetrics.push("MI"); }
  if (!(MA  === "X" || CVSS.Weight.CIA.hasOwnProperty(MA)))   { badMetrics.push("MA"); }

  if (badMetrics.length > 0) {
    return { success: false, errorType: "UnknownMetricValue", errorMetrics: badMetrics };
  }



  // GATHER WEIGHTS FOR ALL METRICS

  var metricWeightAV  = CVSS.Weight.AV    [AV];
  var metricWeightAC  = CVSS.Weight.AC    [AC];
  var metricWeightPR  = CVSS.Weight.PR    [S][PR];  // PR depends on the value of Scope (S).
  var metricWeightUI  = CVSS.Weight.UI    [UI];
  var metricWeightS   = CVSS.Weight.S     [S];
  var metricWeightC   = CVSS.Weight.CIA   [C];
  var metricWeightI   = CVSS.Weight.CIA   [I];
  var metricWeightA   = CVSS.Weight.CIA   [A];

  var metricWeightE   = CVSS.Weight.E     [E];
  var metricWeightRL  = CVSS.Weight.RL    [RL];
  var metricWeightRC  = CVSS.Weight.RC    [RC];

  // For metrics that are modified versions of Base Score metrics, e.g. Modified Attack Vector, use the value of
  // the Base Score metric if the modified version value is "X" ("Not Defined").
  var metricWeightCR  = CVSS.Weight.CIAR  [CR];
  var metricWeightIR  = CVSS.Weight.CIAR  [IR];
  var metricWeightAR  = CVSS.Weight.CIAR  [AR];
  var metricWeightMAV = CVSS.Weight.AV    [MAV !== "X" ? MAV : AV];
  var metricWeightMAC = CVSS.Weight.AC    [MAC !== "X" ? MAC : AC];
  var metricWeightMPR = CVSS.Weight.PR    [MS  !== "X" ? MS  : S] [MPR !== "X" ? MPR : PR];  // Depends on MS.
  var metricWeightMUI = CVSS.Weight.UI    [MUI !== "X" ? MUI : UI];
  var metricWeightMS  = CVSS.Weight.S     [MS  !== "X" ? MS  : S];
  var metricWeightMC  = CVSS.Weight.CIA   [MC  !== "X" ? MC  : C];
  var metricWeightMI  = CVSS.Weight.CIA   [MI  !== "X" ? MI  : I];
  var metricWeightMA  = CVSS.Weight.CIA   [MA  !== "X" ? MA  : A];



  // CALCULATE THE CVSS BASE SCORE

  var baseScore;
  var impactSubScore;
  var exploitabalitySubScore = CVSS.exploitabilityCoefficient * metricWeightAV * metricWeightAC * metricWeightPR * metricWeightUI;
  var impactSubScoreMultiplier = (1 - ((1 - metricWeightC) * (1 - metricWeightI) * (1 - metricWeightA)));

  if (S === 'U') {
    impactSubScore = metricWeightS * impactSubScoreMultiplier;
  } else {
    impactSubScore = metricWeightS * (impactSubScoreMultiplier - 0.029) - 3.25 * Math.pow(impactSubScoreMultiplier - 0.02, 15);
  }

  if (impactSubScore <= 0) {
    baseScore = 0;
  } else {
    if (S === 'U') {
      baseScore = CVSS.roundUp1(Math.min((exploitabalitySubScore + impactSubScore), 10));
    } else {
      baseScore = CVSS.roundUp1(Math.min((exploitabalitySubScore + impactSubScore) * CVSS.scopeCoefficient, 10));
    }
  }



  // CALCULATE THE CVSS TEMPORAL SCORE

  var temporalScore = CVSS.roundUp1(baseScore * metricWeightE * metricWeightRL * metricWeightRC);


  // CALCULATE THE CVSS ENVIRONMENTAL SCORE
  //
  // - envExploitabalitySubScore recalculates the Base Score Exploitability sub-score using any modified values from the
  //   Environmental metrics group in place of the values specified in the Base Score, if any have been defined.
  // - envAdjustedImpactSubScore recalculates the Base Score Impact sub-score using any modified values from the
  //   Environmental metrics group in place of the values specified in the Base Score, and any additional weightings
  //   given in the Environmental metrics group.

  var envScore;
  var envModifiedImpactSubScore;
  var envModifiedExploitabalitySubScore = CVSS.exploitabilityCoefficient * metricWeightMAV * metricWeightMAC * metricWeightMPR * metricWeightMUI;

  var envImpactSubScoreMultiplier = Math.min (1 - (
                                               (1 - metricWeightMC * metricWeightCR) *
                                               (1 - metricWeightMI * metricWeightIR) *
                                               (1 - metricWeightMA * metricWeightAR)), 0.915);

  if (MS === "U" ||
     (MS === "X" && S === "U")) {
    envModifiedImpactSubScore = metricWeightMS * envImpactSubScoreMultiplier;
    envScore = CVSS.roundUp1(CVSS.roundUp1(Math.min((envModifiedImpactSubScore + envModifiedExploitabalitySubScore), 10)) *
                        metricWeightE * metricWeightRL * metricWeightRC);
    } else {
    envModifiedImpactSubScore = metricWeightMS * (envImpactSubScoreMultiplier - 0.029) - 3.25 * Math.pow(envImpactSubScoreMultiplier - 0.02, 15);
    envScore = CVSS.roundUp1(CVSS.roundUp1(Math.min(CVSS.scopeCoefficient * (envModifiedImpactSubScore + envModifiedExploitabalitySubScore), 10)) *
                        metricWeightE * metricWeightRL * metricWeightRC);
  }

  if (envModifiedImpactSubScore <= 0) {
    envScore = 0;
  }


  // CONSTRUCT THE VECTOR STRING

  var vectorString =
    CVSS.CVSSVersionIdentifier +
    "/AV:" + AV +
    "/AC:" + AC +
    "/PR:" + PR +
    "/UI:" + UI +
    "/S:"  + S +
    "/C:"  + C +
    "/I:"  + I +
    "/A:"  + A;

  if (E  !== "X")  {vectorString = vectorString + "/E:" + E;}
  if (RL !== "X")  {vectorString = vectorString + "/RL:" + RL;}
  if (RC !== "X")  {vectorString = vectorString + "/RC:" + RC;}

  if (CR  !== "X") {vectorString = vectorString + "/CR:" + CR;}
  if (IR  !== "X") {vectorString = vectorString + "/IR:"  + IR;}
  if (AR  !== "X") {vectorString = vectorString + "/AR:"  + AR;}
  if (MAV !== "X") {vectorString = vectorString + "/MAV:" + MAV;}
  if (MAC !== "X") {vectorString = vectorString + "/MAC:" + MAC;}
  if (MPR !== "X") {vectorString = vectorString + "/MPR:" + MPR;}
  if (MUI !== "X") {vectorString = vectorString + "/MUI:" + MUI;}
  if (MS  !== "X") {vectorString = vectorString + "/MS:"  + MS;}
  if (MC  !== "X") {vectorString = vectorString + "/MC:"  + MC;}
  if (MI  !== "X") {vectorString = vectorString + "/MI:"  + MI;}
  if (MA  !== "X") {vectorString = vectorString + "/MA:"  + MA;}


  // Return an object containing the scores for all three metric groups, and an overall vector string.

  return {
    success: true,
    baseMetricScore: baseScore.toFixed(1),
    baseSeverity: CVSS.severityRating( baseScore.toFixed(1) ),

    temporalMetricScore: temporalScore.toFixed(1),
    temporalSeverity: CVSS.severityRating( temporalScore.toFixed(1) ),

    environmentalMetricScore: envScore.toFixed(1),
    environmentalSeverity: CVSS.severityRating( envScore.toFixed(1) ),

    vectorString: vectorString
  };
};




/* ** CVSS.calculateCVSSFromVector **
 *
 * Takes Base, Temporal and Environmental metric values as a single string in the Vector String format defined
 * in the CVSS v3.0 standard definition of the Vector String.
 *
 * Returns Base, Temporal and Environmental scores, severity ratings, and an overall Vector String. All Base metrics
 * are required to generate this output. All Temporal and Environmental metric values are optional. Any that are not
 * passed default to "X" ("Not Defined").
 *
 * See the comment for the CVSS.calculateCVSSFromMetrics function for details on the function output. In addition to
 * the error conditions listed for that function, this function can also return:
 *   "MalformedVectorString", if the Vector String passed is does not conform to the format in the standard; or
 *   "MultipleDefinitionsOfMetric", if the Vector String is well formed but defines the same metric (or metrics),
 *                                  more than once.
 */
CVSS.calculateCVSSFromVector = function ( vectorString ) {

  var metricValues = {
    AV:  undefined, AC:  undefined, PR:  undefined, UI:  undefined, S:  undefined,
    C:   undefined, I:   undefined, A:   undefined,
    E:   undefined, RL:  undefined, RC:  undefined,
    CR:  undefined, IR:  undefined, AR:  undefined,
    MAV: undefined, MAC: undefined, MPR: undefined, MUI: undefined, MS: undefined,
    MC:  undefined, MI:  undefined, MA:  undefined
  };

  // If input validation fails, this array is populated with strings indicating which metrics failed validation.
  var badMetrics = [];

  if (!CVSS.vectorStringRegex_30.test(vectorString)) {
    return { success: false, errorType: "MalformedVectorString" };
  }

  var metricNameValue = vectorString.substring(CVSS.CVSSVersionIdentifier.length).split("/");

  for (var i in metricNameValue) {
    if (metricNameValue.hasOwnProperty(i)) {

      var singleMetric = metricNameValue[i].split(":");

      if (typeof metricValues[singleMetric[0]] === "undefined") {
        metricValues[singleMetric[0]] = singleMetric[1];
      } else {
        badMetrics.push(singleMetric[0]);
      }
    }
  }

  if (badMetrics.length > 0) {
    return { success: false, errorType: "MultipleDefinitionsOfMetric", errorMetrics: badMetrics };
  }

  return CVSS.calculateCVSSFromMetrics (
    metricValues.AV,  metricValues.AC,  metricValues.PR,  metricValues.UI,  metricValues.S,
    metricValues.C,   metricValues.I,   metricValues.A,
    metricValues.E,   metricValues.RL,  metricValues.RC,
    metricValues.CR,  metricValues.IR,  metricValues.AR,
    metricValues.MAV, metricValues.MAC, metricValues.MPR, metricValues.MUI, metricValues.MS,
    metricValues.MC,  metricValues.MI,  metricValues.MA);
};




/* ** CVSS.roundUp1 **
 *
 * Rounds up the number passed as a parameter to 1 decimal place and returns the result.
 *
 * Standard JavaScript errors thrown when arithmetic operations are performed on non-numbers will be returned if the
 * given input is not a number.
 */
CVSS.roundUp1 = function (d) {
  return Math.ceil (d * 10) / 10;
};




/* ** CVSS.severityRating **
 *
 * Given a CVSS score, returns the name of the severity rating as defined in the CVSS standard.
 * The input needs to be a number between 0.0 to 10.0, to one decimal place of precision.
 *
 * The following error values may be returned instead of a severity rating name:
 *   NaN (JavaScript "Not a Number") - if the input is not a number.
 *   undefined - if the input is a number that is not within the range of any defined severity rating.
 */
CVSS.severityRating = function (score) {
  var severityRatingLength = CVSS.severityRatings.length;

  var validatedScore = Number(score);

  if (isNaN(validatedScore)) {
    return validatedScore;
  }

  for (var i = 0; i < severityRatingLength; i++) {
    if (score >= CVSS.severityRatings[i].bottom && score <= CVSS.severityRatings[i].top) {
      return CVSS.severityRatings[i].name;
    }
  }

  return undefined;
};



///////////////////////////////////////////////////////////////////////////
// DATA AND FUNCTIONS FOR CREATING AN XML REPRESENTATION OF A CVSS SCORE //
///////////////////////////////////////////////////////////////////////////

// A mapping between abbreviated metric values and the string used in the XML representation.
// For example, a Remediation Level (RL) abbreviated metric value of "W" maps to "WORKAROUND".
// For brevity, Base metric values their modified equivalents in the Environmental metric group. We can do this
// because the latter is the same as the former, except it also includes a "NOT_DEFINED" value.

CVSS.XML_MetricNames = {
  E:    { X: "NOT_DEFINED", U: "UNPROVEN",     P: "PROOF_OF_CONCEPT",  F: "FUNCTIONAL",  H: "HIGH"},
  RL:   { X: "NOT_DEFINED", O: "OFFICIAL_FIX", T: "TEMPORARY_FIX",     W: "WORKAROUND",  U: "UNAVAILABLE"},
  RC:   { X: "NOT_DEFINED", U: "UNKNOWN",      R: "REASONABLE",        C: "CONFIRMED"},

  CIAR: { X: "NOT_DEFINED", L: "LOW",              M: "MEDIUM", H: "HIGH"},         // CR, IR and AR use the same metric names
  MAV:  { N: "NETWORK",     A: "ADJACENT_NETWORK", L: "LOCAL",  P: "PHYSICAL", X: "NOT_DEFINED" },
  MAC:  { H: "HIGH",        L: "LOW",              X: "NOT_DEFINED" },
  MPR:  { N: "NONE",        L: "LOW",              H: "HIGH",   X: "NOT_DEFINED" },
  MUI:  { N: "NONE",        R: "REQUIRED",         X: "NOT_DEFINED" },
  MS:   { U: "UNCHANGED",   C: "CHANGED",          X: "NOT_DEFINED" },
  MCIA: { N: "NONE",        L: "LOW",              H: "HIGH",   X: "NOT_DEFINED" }  // C, I and A use the same metric names
};



/* ** CVSS.generateXMLFromMetrics **
 *
 * Takes Base, Temporal and Environmental metric values as individual parameters. Their values are in the short format
 * defined in the CVSS v3.0 standard definition of the Vector String. For example, the AttackComplexity parameter
 * should be either "H" or "L".
 *
 * Returns a single string containing the metric values in XML form. All Base metrics are required to generate this
 * output. All Temporal and Environmental metric values are optional. Any that are not passed will be represented in
 * the XML as NOT_DEFINED. The function returns a string for simplicity. It is arguably better to return the XML as
 * a DOM object, but at the time of writing this leads to complexity due to older browsers using different JavaScript
 * interfaces to do this. Also for simplicity, all Temporal and Environmental metrics are include in the string,
 * even though those with a value of "Not Defined" do not need to be included.
 *
 * The output of this function is an object which always has a property named "success".
 *
 * If no errors are encountered, success is Boolean "true", and the "xmlString" property contains the XML string
 * representation.
 *
 * If errors are encountered, success is Boolean "false", and other properties are defined as per the
 * CVSS.calculateCVSSFromMetrics function. Refer to the comment for that function for more details.
 */
CVSS.generateXMLFromMetrics = function (
  AttackVector, AttackComplexity, PrivilegesRequired, UserInteraction, Scope, Confidentiality, Integrity, Availability,
  ExploitCodeMaturity, RemediationLevel, ReportConfidence,
  ConfidentialityRequirement, IntegrityRequirement, AvailabilityRequirement,
  ModifiedAttackVector, ModifiedAttackComplexity, ModifiedPrivilegesRequired, ModifiedUserInteraction, ModifiedScope,
  ModifiedConfidentiality, ModifiedIntegrity, ModifiedAvailability) {

  // A string containing the XML we wish to output, with placeholders for the CVSS metrics we will substitute for
  // their values, based on the inputs passed to this function.
  var xmlTemplate =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<cvssv3.0 xmlns="https://www.first.org/cvss/cvss-v3.0.xsd"\n' +
    '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
    '  xsi:schemaLocation="https://www.first.org/cvss/cvss-v3.0.xsd https://www.first.org/cvss/cvss-v3.0.xsd"\n' +
    '  >\n' +
    '\n' +
    '  <base_metrics>\n' +
    '    <attack-vector>__AttackVector__</attack-vector>\n' +
    '    <attack-complexity>__AttackComplexity__</attack-complexity>\n' +
    '    <privileges-required>__PrivilegesRequired__</privileges-required>\n' +
    '    <user-interaction>__UserInteraction__</user-interaction>\n' +
    '    <scope>__Scope__</scope>\n' +
    '    <confidentiality-impact>__Confidentiality__</confidentiality-impact>\n' +
    '    <integrity-impact>__Integrity__</integrity-impact>\n' +
    '    <availability-impact>__Availability__</availability-impact>\n' +
    '    <base-score>__BaseScore__</base-score>\n' +
    '    <base-severity>__BaseSeverityRating__</base-severity>\n' +
    '  </base_metrics>\n' +
    '\n' +
    '  <temporal_metrics>\n' +
    '    <exploit-code-maturity>__ExploitCodeMaturity__</exploit-code-maturity>\n' +
    '    <remediation-level>__RemediationLevel__</remediation-level>\n' +
    '    <report-confidence>__ReportConfidence__</report-confidence>\n' +
    '    <temporal-score>__TemporalScore__</temporal-score>\n' +
    '    <temporal-severity>__TemporalSeverityRating__</temporal-severity>\n' +
    '  </temporal_metrics>\n' +
    '\n' +
    '  <environmental_metrics>\n' +
    '    <confidentiality-requirement>__ConfidentialityRequirement__</confidentiality-requirement>\n' +
    '    <integrity-requirement>__IntegrityRequirement__</integrity-requirement>\n' +
    '    <availability-requirement>__AvailabilityRequirement__</availability-requirement>\n' +
    '    <modified-attack-vector>__ModifiedAttackVector__</modified-attack-vector>\n' +
    '    <modified-attack-complexity>__ModifiedAttackComplexity__</modified-attack-complexity>\n' +
    '    <modified-privileges-required>__ModifiedPrivilegesRequired__</modified-privileges-required>\n' +
    '    <modified-user-interaction>__ModifiedUserInteraction__</modified-user-interaction>\n' +
    '    <modified-scope>__ModifiedScope__</modified-scope>\n' +
    '    <modified-confidentiality-impact>__ModifiedConfidentiality__</modified-confidentiality-impact>\n' +
    '    <modified-integrity-impact>__ModifiedIntegrity__</modified-integrity-impact>\n' +
    '    <modified-availability-impact>__ModifiedAvailability__</modified-availability-impact>\n' +
    '    <environmental-score>__EnvironmentalScore__</environmental-score>\n' +
    '    <environmental-severity>__EnvironmentalSeverityRating__</environmental-severity>\n' +
    '  </environmental_metrics>\n' +
    '\n' +
    '</cvssv3.0>\n';


  // Call CVSS.calculateCVSSFromMetrics to validate all the parameters and generate scores and severity ratings.
  // If that function returns an error, immediately return it to the caller of this function.
  var result = CVSS.calculateCVSSFromMetrics (
    AttackVector, AttackComplexity, PrivilegesRequired, UserInteraction, Scope, Confidentiality, Integrity, Availability,
    ExploitCodeMaturity, RemediationLevel, ReportConfidence,
    ConfidentialityRequirement, IntegrityRequirement, AvailabilityRequirement,
    ModifiedAttackVector, ModifiedAttackComplexity, ModifiedPrivilegesRequired, ModifiedUserInteraction, ModifiedScope,
    ModifiedConfidentiality, ModifiedIntegrity, ModifiedAvailability);

  if (result.success !== true) {
    return result;
  }

  var xmlOutput = xmlTemplate;
  xmlOutput = xmlOutput.replace ("__AttackVector__",        CVSS.XML_MetricNames["MAV"][AttackVector]);
  xmlOutput = xmlOutput.replace ("__AttackComplexity__",    CVSS.XML_MetricNames["MAC"][AttackComplexity]);
  xmlOutput = xmlOutput.replace ("__PrivilegesRequired__",  CVSS.XML_MetricNames["MPR"][PrivilegesRequired]);
  xmlOutput = xmlOutput.replace ("__UserInteraction__",     CVSS.XML_MetricNames["MUI"][UserInteraction]);
  xmlOutput = xmlOutput.replace ("__Scope__",               CVSS.XML_MetricNames["MS"][Scope]);
  xmlOutput = xmlOutput.replace ("__Confidentiality__",     CVSS.XML_MetricNames["MCIA"][Confidentiality]);
  xmlOutput = xmlOutput.replace ("__Integrity__",           CVSS.XML_MetricNames["MCIA"][Integrity]);
  xmlOutput = xmlOutput.replace ("__Availability__",        CVSS.XML_MetricNames["MCIA"][Availability]);
  xmlOutput = xmlOutput.replace ("__BaseScore__",           result.baseMetricScore);
  xmlOutput = xmlOutput.replace ("__BaseSeverityRating__",  result.baseSeverity);

  xmlOutput = xmlOutput.replace ("__ExploitCodeMaturity__",     CVSS.XML_MetricNames["E"][ExploitCodeMaturity || "X"]);
  xmlOutput = xmlOutput.replace ("__RemediationLevel__",        CVSS.XML_MetricNames["RL"][RemediationLevel || "X"]);
  xmlOutput = xmlOutput.replace ("__ReportConfidence__",        CVSS.XML_MetricNames["RC"][ReportConfidence || "X"]);
  xmlOutput = xmlOutput.replace ("__TemporalScore__",           result.temporalMetricScore);
  xmlOutput = xmlOutput.replace ("__TemporalSeverityRating__",  result.temporalSeverity);

  xmlOutput = xmlOutput.replace ("__ConfidentialityRequirement__",  CVSS.XML_MetricNames["CIAR"][ConfidentialityRequirement || "X"]);
  xmlOutput = xmlOutput.replace ("__IntegrityRequirement__",        CVSS.XML_MetricNames["CIAR"][IntegrityRequirement || "X"]);
  xmlOutput = xmlOutput.replace ("__AvailabilityRequirement__",     CVSS.XML_MetricNames["CIAR"][AvailabilityRequirement || "X"]);
  xmlOutput = xmlOutput.replace ("__ModifiedAttackVector__",        CVSS.XML_MetricNames["MAV"][ModifiedAttackVector || "X"]);
  xmlOutput = xmlOutput.replace ("__ModifiedAttackComplexity__",    CVSS.XML_MetricNames["MAC"][ModifiedAttackComplexity || "X"]);
  xmlOutput = xmlOutput.replace ("__ModifiedPrivilegesRequired__",  CVSS.XML_MetricNames["MPR"][ModifiedPrivilegesRequired || "X"]);
  xmlOutput = xmlOutput.replace ("__ModifiedUserInteraction__",     CVSS.XML_MetricNames["MUI"][ModifiedUserInteraction || "X"]);
  xmlOutput = xmlOutput.replace ("__ModifiedScope__",               CVSS.XML_MetricNames["MS"][ModifiedScope || "X"]);
  xmlOutput = xmlOutput.replace ("__ModifiedConfidentiality__",     CVSS.XML_MetricNames["MCIA"][ModifiedConfidentiality || "X"]);
  xmlOutput = xmlOutput.replace ("__ModifiedIntegrity__",           CVSS.XML_MetricNames["MCIA"][ModifiedIntegrity || "X"]);
  xmlOutput = xmlOutput.replace ("__ModifiedAvailability__",        CVSS.XML_MetricNames["MCIA"][ModifiedAvailability || "X"]);
  xmlOutput = xmlOutput.replace ("__EnvironmentalScore__",          result.environmentalMetricScore);
  xmlOutput = xmlOutput.replace ("__EnvironmentalSeverityRating__", result.environmentalSeverity);

  return { success: true, xmlString: xmlOutput };
};



/* ** CVSS.generateXMLFromVector **
 *
 * Takes Base, Temporal and Environmental metric values as a single string in the Vector String format defined
 * in the CVSS v3.0 standard definition of the Vector String.
 *
 * Returns an XML string representation of this input. See the comment for CVSS.generateXMLFromMetrics for more
 * detail on inputs, return values and errors. In addition to the error conditions listed for that function, this
 * function can also return:
 *   "MalformedVectorString", if the Vector String passed is does not conform to the format in the standard; or
 *   "MultipleDefinitionsOfMetric", if the Vector String is well formed but defines the same metric (or metrics),
 *                                  more than once.
 */
CVSS.generateXMLFromVector = function ( vectorString ) {

  var metricValues = {
    AV:  undefined, AC:  undefined, PR:  undefined, UI:  undefined, S:  undefined,
    C:   undefined, I:   undefined, A:   undefined,
    E:   undefined, RL:  undefined, RC:  undefined,
    CR:  undefined, IR:  undefined, AR:  undefined,
    MAV: undefined, MAC: undefined, MPR: undefined, MUI: undefined, MS: undefined,
    MC:  undefined, MI:  undefined, MA:  undefined
  };

  // If input validation fails, this array is populated with strings indicating which metrics failed validation.
  var badMetrics = [];

  if (!CVSS.vectorStringRegex_30.test(vectorString)) {
    return { success: false, errorType: "MalformedVectorString" };
  }

  var metricNameValue = vectorString.substring(CVSS.CVSSVersionIdentifier.length).split("/");

  for (var i in metricNameValue) {
    if (metricNameValue.hasOwnProperty(i)) {

      var singleMetric = metricNameValue[i].split(":");

      if (typeof metricValues[singleMetric[0]] === "undefined") {
        metricValues[singleMetric[0]] = singleMetric[1];
      } else {
        badMetrics.push(singleMetric[0]);
      }
    }
  }

  if (badMetrics.length > 0) {
    return { success: false, errorType: "MultipleDefinitionsOfMetric", errorMetrics: badMetrics };
  }

  return CVSS.generateXMLFromMetrics (
    metricValues.AV,  metricValues.AC,  metricValues.PR,  metricValues.UI,  metricValues.S,
    metricValues.C,   metricValues.I,   metricValues.A,
    metricValues.E,   metricValues.RL,  metricValues.RC,
    metricValues.CR,  metricValues.IR,  metricValues.AR,
    metricValues.MAV, metricValues.MAC, metricValues.MPR, metricValues.MUI, metricValues.MS,
    metricValues.MC,  metricValues.MI,  metricValues.MA);
};

var CVSS_Help = {};

// This object is used as an associative array mapping the names of elements on the web page to help text that is
// added as title text. Browsers will display the text when the element is hovered over with the cursor.
CVSS_Help.helpText_en = {
  "baseMetricGroup_Legend" : "The Base Metric group represents the intrinsic  characteristics of a vulnerability that are constant over time and across user environments. Determine the vulnerable component and score Attack Vector, Attack Complexity, Privileges Required and User Interaction relative to this.",

  "AV_Heading" : "This metric reflects the context by which vulnerability exploitation is possible. The Base Score increases the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable component.",
  "AV_N_Label" : "A vulnerability exploitable with network access means the vulnerable component is bound to the network stack and the attacker's path is through OSI layer 3 (the network layer). Such a vulnerability is often termed \"remotely exploitable\” and can be thought of as an attack being exploitable one or more network hops away.",
  "AV_A_Label" : "A vulnerability exploitable with adjacent network access means the vulnerable component is bound to the network stack, however the attack is limited to the same shared physical (e.g. Bluetooth, IEEE 802.11), or logical (e.g. local IP subnet) network, and cannot be performed across an OSI layer 3 boundary (e.g. a router).",
  "AV_L_Label" : "A vulnerability exploitable with local access means that the vulnerable component is not bound to the network stack, and the attacker’s path is via read/write/execute capabilities. In some cases, the attacker may be logged in locally in order to exploit the vulnerability, otherwise, she may rely on User Interaction to execute a malicious file.",
  "AV_P_Label" : "A vulnerability exploitable with physical access requires the attacker to physically touch or manipulate the vulnerable component. Physical interaction may be brief or persistent.",

  "AC_Heading" : "This metric describes the conditions beyond the attacker’s control that must exist in order to exploit the vulnerability. Such conditions may require the collection of more information about the target, the presence of certain system configuration settings, or computational exceptions.",
  "AC_L_Label" : "Specialized access conditions or extenuating circumstances do not exist. An attacker can expect repeatable success against the vulnerable component.",
  "AC_H_Label" : "A successful attack depends on conditions beyond the attacker's control. That is, a successful attack cannot be accomplished at will, but requires the attacker to invest in some measurable amount of effort in preparation or execution against the vulnerable component before a successful attack can be expected. For example, a successful attack may require the attacker: to perform target-specific reconnaissance; to prepare the target environment to improve exploit reliability; or to inject herself into the logical network path between the target and the resource requested by the victim in order to read and/or modify network communications (e.g. a man in the middle attack).",

  "PR_Heading" : "This metric describes the level of privileges an attacker must possess before successfully exploiting the vulnerability. This Base Score increases as fewer privileges are required.",
  "PR_N_Label" : "The attacker is unauthorized prior to attack, and therefore does not require any access to settings or files to carry out an attack.",
  "PR_L_Label" : "The attacker is authorized with (i.e. requires) privileges that provide basic user capabilities that could normally affect only settings and files owned by a user. Alternatively, an attacker with Low privileges may have the ability to cause an impact only to non-sensitive resources.",
  "PR_H_Label" : "The attacker is authorized with (i.e. requires) privileges that provide significant (e.g. administrative) control over the vulnerable component that could affect component-wide settings and files.",

  "UI_Heading" : "This metric captures the requirement for a user, other than the attacker, to participate in the successful compromise the vulnerable component. This metric determines whether the vulnerability can be exploited solely at the will of the attacker, or whether a separate user (or user-initiated process) must participate in some manner. The Base Score is highest when no user interaction is required.",
  "UI_N_Label" : "The vulnerable system can be exploited without any interaction from any user.",
  "UI_R_Label" : "Successful exploitation of this vulnerability requires a user to take some action before the vulnerability can be exploited.",

  "S_Heading" : "Does a successful attack impact a component other than the vulnerable component? If so, the Base Score increases and the Confidentiality, Integrity and Authentication metrics should be scored relative to the impacted component.",
  "S_U_Label" : "An exploited vulnerability can only affect resources managed by the same authority. In this case the vulnerable component and the impacted component are the same.",
  "S_C_Label" : "An exploited vulnerability can affect resources beyond the authorization privileges intended by the vulnerable component. In this case the vulnerable component and the impacted component are different.",

  "C_Heading" : "This metric measures the impact to the confidentiality of the information resources managed by a software component due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones.",
  "C_N_Label" : "There is no loss of confidentiality within the impacted component.",
  "C_L_Label" : "There is some loss of confidentiality. Access to some restricted information is obtained, but the attacker does not have control over what information is obtained, or the amount or kind of loss is constrained. The information disclosure does not cause a direct, serious loss to the impacted component.",
  "C_H_Label" : "There is total loss of confidentiality, resulting in all resources within the impacted component being divulged to the attacker. Alternatively, access to only some restricted information is obtained, but the disclosed information presents a direct, serious impact.",

  "I_Heading" : "This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information.",
  "I_N_Label" : "There is no loss of integrity within the impacted component.",
  "I_L_Label" : "Modification of data is possible, but the attacker does not have control over the consequence of a modification, or the amount of modification is constrained. The data modification does not have a direct, serious impact on the impacted component.",
  "I_H_Label" : "There is a total loss of integrity, or a complete loss of protection. For example, the attacker is able to modify any/all files protected by the impacted component. Alternatively, only some files can be modified, but malicious modification would present a direct, serious consequence to the impacted component.",

  "A_Heading" : "This metric measures the impact to the availability of the impacted component resulting from a successfully exploited vulnerability. It refers to the loss of availability of the impacted component itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of an impacted component.",
  "A_N_Label" : "There is no impact to availability within the impacted component.",
  "A_L_Label" : "There is reduced performance or interruptions in resource availability. Even if repeated exploitation of the vulnerability is possible, the attacker does not have the ability to completely deny service to legitimate users. The resources in the impacted component are either partially available all of the time, or fully available only some of the time, but overall there is no direct, serious consequence to the impacted component.",
  "A_H_Label" : "There is total loss of availability, resulting in the attacker being able to fully deny access to resources in the impacted component; this loss is either sustained (while the attacker continues to deliver the attack) or persistent (the condition persists even after the attack has completed). Alternatively, the attacker has the ability to deny some availability, but the loss of availability presents a direct, serious consequence to the impacted component (e.g., the attacker cannot disrupt existing connections, but can prevent new connections; the attacker can repeatedly exploit a vulnerability that, in each instance of a successful attack, leaks a only small amount of memory, but after repeated exploitation causes a service to become completely unavailable).",

  "temporalMetricGroup_Legend" : "The Temporal metrics measure the current state of exploit techniques or code availability, the existence of any patches or workarounds, or the confidence that one has in the description of a vulnerability.",

  "E_Heading" : "This metric measures the likelihood of the vulnerability being attacked, and is typically based on the current state of exploit techniques, exploit code availability, or active, 'in-the-wild' exploitation.",
  "E_X_Label" : "Assigning this value to the metric will not influence the score.",
  "E_U_Label" : "No exploit code is available, or an exploit is theoretical.",
  "E_P_Label" : "Proof-of-concept exploit code is available, or an attack demonstration is not practical for most systems. The code or technique is not functional in all situations and may require substantial modification by a skilled attacker.",
  "E_F_Label" : "Functional exploit code is available. The code works in most situations where the vulnerability exists.",
  "E_H_Label" : "Functional autonomous code exists, or no exploit is required (manual trigger) and details are widely available. Exploit code works in every situation, or is actively being delivered via an autonomous agent (such as a worm or virus). Network-connected systems are likely to encounter scanning or exploitation attempts. Exploit development has reached the level of reliable, widely-available, easy-to-use automated tools.",

  "RL_Heading" : "The Remediation Level of a vulnerability is an important factor for prioritization. The typical vulnerability is unpatched when initially published. Workarounds or hotfixes may offer interim remediation until an official patch or upgrade is issued. Each of these respective stages adjusts the temporal score downwards, reflecting the decreasing urgency as remediation becomes final.",
  "RL_X_Label" : "Assigning this value to the metric will not influence the score.",
  "RL_O_Label" : "A complete vendor solution is available. Either the vendor has issued an official patch, or an upgrade is available.",
  "RL_T_Label" : "There is an official but temporary fix available. This includes instances where the vendor issues a temporary hotfix, tool, or workaround.",
  "RL_W_Label" : "There is an unofficial, non-vendor solution available. In some cases, users of the affected technology will create a patch of their own or provide steps to work around or otherwise mitigate the vulnerability.",
  "RL_U_Label" : "There is either no solution available or it is impossible to apply.",

  "RC_Heading" : "This metric measures the degree of confidence in the existence of the vulnerability and the credibility of the known technical details. Sometimes only the existence of vulnerabilities are publicized, but without specific details. For example, an impact may be recognized as undesirable, but the root cause may not be known. The vulnerability may later be corroborated by research which suggests where the vulnerability may lie, though the research may not be certain. Finally, a vulnerability may be confirmed through acknowledgement by the author or vendor of the affected technology. The urgency of a vulnerability is higher when a vulnerability is known to exist with certainty. This metric also suggests the level of technical knowledge available to would-be attackers.",
  "RC_X_Label" : "Assigning this value to the metric will not influence the score.",
  "RC_U_Label" : "There are reports of impacts that indicate a vulnerability is present. The reports indicate that the cause of the vulnerability is unknown, or reports may differ on the cause or impacts of the vulnerability. Reporters are uncertain of the true nature of the vulnerability, and there is little confidence in the validity of the reports or whether a static Base score can be applied given the differences described. An example is a bug report which notes that an intermittent but non-reproducible crash occurs, with evidence of memory corruption suggesting that denial of service, or possible more serious impacts, may result.",
  "RC_R_Label" : "Significant details are published, but researchers either do not have full confidence in the root cause, or do not have access to source code to fully confirm all of the interactions that may lead to the result. Reasonable confidence exists, however, that the bug is reproducible and at least one impact is able to be verified (Proof-of-concept exploits may provide this). An example is a detailed write-up of research into a vulnerability with an explanation (possibly obfuscated or 'left as an exercise to the reader') that gives assurances on how to reproduce the results.",
  "RC_C_Label" : "Detailed reports exist, or functional reproduction is possible (functional exploits may provide this). Source code is available to independently verify the assertions of the research, or the author or vendor of the affected code has confirmed the presence of the vulnerability.",

  "environmentalMetricGroup_Legend" : "These metrics enable the analyst to customize the CVSS score depending on the importance of the affected IT asset to a user’s organization, measured in terms of complementary/alternative security controls in place, Confidentiality, Integrity, and Availability. The metrics are the modified equivalent of base metrics and are assigned metric values based on the component placement in organization infrastructure.",

  "CR_Heading" : "These metrics enable the analyst to customize the CVSS score depending on the importance of the Confidentiality of the affected IT asset to a user’s organization, relative to other impacts. This metric modifies the environmental score by reweighting the Modified Confidentiality impact metric versus the other modified impacts.",
  "CR_X_Label" : "Assigning this value to the metric will not influence the score.",
  "CR_L_Label" : "Loss of Confidentiality is likely to have only a limited adverse effect on the organization or individuals associated with the organization (e.g., employees, customers).",
  "CR_M_Label" : "Assigning this value to the metric will not influence the score.",
  "CR_H_Label" : "Loss of Confidentiality is likely to have a catastrophic adverse effect on the organization or individuals associated with the organization (e.g., employees, customers).",

  "IR_Heading" : "These metrics enable the analyst to customize the CVSS score depending on the importance of the Integrity of the affected IT asset to a user’s organization, relative to other impacts. This metric modifies the environmental score by reweighting the Modified Integrity impact metric versus the other modified impacts.",
  "IR_X_Label" : "Assigning this value to the metric will not influence the score.",
  "IR_L_Label" : "Loss of Integrity is likely to have only a limited adverse effect on the organization or individuals associated with the organization (e.g., employees, customers).",
  "IR_M_Label" : "Assigning this value to the metric will not influence the score.",
  "IR_H_Label" : "Loss of Integrity is likely to have a catastrophic adverse effect on the organization or individuals associated with the organization (e.g., employees, customers).",

  "AR_Heading" : "These metrics enable the analyst to customize the CVSS score depending on the importance of the Availability of the affected IT asset to a user’s organization, relative to other impacts. This metric modifies the environmental score by reweighting the Modified Availability impact metric versus the other modified impacts.",
  "AR_X_Label" : "Assigning this value to the metric will not influence the score.",
  "AR_L_Label" : "Loss of Availability is likely to have only a limited adverse effect on the organization or individuals associated with the organization (e.g., employees, customers).",
  "AR_M_Label" : "Assigning this value to the metric will not influence the score.",
  "AR_H_Label" : "Loss of Availability is likely to have a catastrophic adverse effect on the organization or individuals associated with the organization (e.g., employees, customers).",

  // All the following text should be copied exactly from the Base Score metrics (above), except that
  // "Not Defined (X)" values need to be added.
  "MAV_Heading" : "This metric reflects the context by which vulnerability exploitation is possible. The Base Score increases the more remote (logically, and physically) an attacker can be in order to exploit the vulnerable component.",
  "MAV_X_Label" : "Use the value assigned to the corresponding Base Score metric.",
  "MAV_N_Label" : "A vulnerability exploitable with network access means the vulnerable component is bound to the network stack and the attacker's path is through OSI layer 3 (the network layer). Such a vulnerability is often termed \"remotely exploitable\” and can be thought of as an attack being exploitable one or more network hops away.",
  "MAV_A_Label" : "A vulnerability exploitable with adjacent network access means the vulnerable component is bound to the network stack, however the attack is limited to the same shared physical (e.g. Bluetooth, IEEE 802.11), or logical (e.g. local IP subnet) network, and cannot be performed across an OSI layer 3 boundary (e.g. a router).",
  "MAV_L_Label" : "A vulnerability exploitable with local access means that the vulnerable component is not bound to the network stack, and the attacker’s path is via read/write/execute capabilities. In some cases, the attacker may be logged in locally in order to exploit the vulnerability, otherwise, she may rely on User Interaction to execute a malicious file.",
  "MAV_P_Label" : "A vulnerability exploitable with physical access requires the attacker to physically touch or manipulate the vulnerable component. Physical interaction may be brief or persistent.",

  "MAC_Heading" : "This metric describes the conditions beyond the attacker’s control that must exist in order to exploit the vulnerability. Such conditions may require the collection of more information about the target, the presence of certain system configuration settings, or computational exceptions.",
  "MAC_X_Label" : "Use the value assigned to the corresponding Base Score metric.",
  "MAC_L_Label" : "Specialized access conditions or extenuating circumstances do not exist. An attacker can expect repeatable success against the vulnerable component.",
  "MAC_H_Label" : "A successful attack depends on conditions beyond the attacker's control. That is, a successful attack cannot be accomplished at will, but requires the attacker to invest in some measurable amount of effort in preparation or execution against the vulnerable component before a successful attack can be expected. For example, a successful attack may require the attacker: to perform target-specific reconnaissance; to prepare the target environment to improve exploit reliability; or to inject herself into the logical network path between the target and the resource requested by the victim in order to read and/or modify network communications (e.g. a man in the middle attack).",

  "MPR_Heading" : "This metric describes the level of privileges an attacker must possess before successfully exploiting the vulnerability. This Base Score increases as fewer privileges are required.",
  "MPR_X_Label" : "Use the value assigned to the corresponding Base Score metric.",
  "MPR_N_Label" : "The attacker is unauthorized prior to attack, and therefore does not require any access to settings or files to carry out an attack.",
  "MPR_L_Label" : "The attacker is authorized with (i.e. requires) privileges that provide basic user capabilities that could normally affect only settings and files owned by a user. Alternatively, an attacker with Low privileges may have the ability to cause an impact only to non-sensitive resources.",
  "MPR_H_Label" : "The attacker is authorized with (i.e. requires) privileges that provide significant (e.g. administrative) control over the vulnerable component that could affect component-wide settings and files.",

  "MUI_Heading" : "This metric captures the requirement for a user, other than the attacker, to participate in the successful compromise the vulnerable component. This metric determines whether the vulnerability can be exploited solely at the will of the attacker, or whether a separate user (or user-initiated process) must participate in some manner. The Base Score is highest when no user interaction is required.",
  "MUI_X_Label" : "Use the value assigned to the corresponding Base Score metric.",
  "MUI_N_Label" : "The vulnerable system can be exploited without any interaction from any user.",
  "MUI_R_Label" : "Successful exploitation of this vulnerability requires a user to take some action before the vulnerability can be exploited.",

  "MS_Heading" : "Does a successful attack impact a component other than the vulnerable component? If so, the Base Score increases and the Confidentiality, Integrity and Authentication metrics should be scored relative to the impacted component.",
  "MS_X_Label" : "Use the value assigned to the corresponding Base Score metric.",
  "MS_U_Label" : "An exploited vulnerability can only affect resources managed by the same authority. In this case the vulnerable component and the impacted component are the same.",
  "MS_C_Label" : "An exploited vulnerability can affect resources beyond the authorization privileges intended by the vulnerable component. In this case the vulnerable component and the impacted component are different.",

  "MC_Heading" : "This metric measures the impact to the confidentiality of the information resources managed by a software component due to a successfully exploited vulnerability. Confidentiality refers to limiting information access and disclosure to only authorized users, as well as preventing access by, or disclosure to, unauthorized ones.",
  "MC_X_Label" : "Use the value assigned to the corresponding Base Score metric.",
  "MC_N_Label" : "There is no loss of confidentiality within the impacted component.",
  "MC_L_Label" : "There is some loss of confidentiality. Access to some restricted information is obtained, but the attacker does not have control over what information is obtained, or the amount or kind of loss is constrained. The information disclosure does not cause a direct, serious loss to the impacted component.",
  "MC_H_Label" : "There is total loss of confidentiality, resulting in all resources within the impacted component being divulged to the attacker. Alternatively, access to only some restricted information is obtained, but the disclosed information presents a direct, serious impact.",

  "MI_Heading" : "This metric measures the impact to integrity of a successfully exploited vulnerability. Integrity refers to the trustworthiness and veracity of information.",
  "MI_X_Label" : "Use the value assigned to the corresponding Base Score metric.",
  "MI_N_Label" : "There is no loss of integrity within the impacted component.",
  "MI_L_Label" : "Modification of data is possible, but the attacker does not have control over the consequence of a modification, or the amount of modification is constrained. The data modification does not have a direct, serious impact on the impacted component.",
  "MI_H_Label" : "There is a total loss of integrity, or a complete loss of protection. For example, the attacker is able to modify any/all files protected by the impacted component. Alternatively, only some files can be modified, but malicious modification would present a direct, serious consequence to the impacted component.",

  "MA_Heading" : "This metric measures the impact to the availability of the impacted component resulting from a successfully exploited vulnerability. It refers to the loss of availability of the impacted component itself, such as a networked service (e.g., web, database, email). Since availability refers to the accessibility of information resources, attacks that consume network bandwidth, processor cycles, or disk space all impact the availability of an impacted component.",
  "MA_X_Label" : "Use the value assigned to the corresponding Base Score metric.",
  "MA_N_Label" : "There is no impact to availability within the impacted component.",
  "MA_L_Label" : "There is reduced performance or interruptions in resource availability. Even if repeated exploitation of the vulnerability is possible, the attacker does not have the ability to completely deny service to legitimate users. The resources in the impacted component are either partially available all of the time, or fully available only some of the time, but overall there is no direct, serious consequence to the impacted component.",
  "MA_H_Label" : "There is total loss of availability, resulting in the attacker being able to fully deny access to resources in the impacted component; this loss is either sustained (while the attacker continues to deliver the attack) or persistent (the condition persists even after the attack has completed). Alternatively, the attacker has the ability to deny some availability, but the loss of availability presents a direct, serious consequence to the impacted component (e.g., the attacker cannot disrupt existing connections, but can prevent new connections; the attacker can repeatedly exploit a vulnerability that, in each instance of a successful attack, leaks a only small amount of memory, but after repeated exploitation causes a service to become completely unavailable)."
};

export function updateScores() { 
  var result=CVSS.calculateCVSSFromMetrics(
      inputValue('input[type="radio"][name=AV]:checked'),
      inputValue('input[type="radio"][name=AC]:checked'),
      inputValue('input[type="radio"][name=PR]:checked'),
      inputValue('input[type="radio"][name=UI]:checked'),
      inputValue('input[type="radio"][name=S]:checked'),
      inputValue('input[type="radio"][name=C]:checked'),
      inputValue('input[type="radio"][name=I]:checked'),
      inputValue('input[type="radio"][name=A]:checked'),
      inputValue('input[type="radio"][name=E]:checked'),
      inputValue('input[type="radio"][name=RL]:checked'),
      inputValue('input[type="radio"][name=RC]:checked'),
      inputValue('input[type="radio"][name=CR]:checked'),
      inputValue('input[type="radio"][name=IR]:checked'),
      inputValue('input[type="radio"][name=AR]:checked'),
      inputValue('input[type="radio"][name=MAV]:checked'),
      inputValue('input[type="radio"][name=MAC]:checked'),
      inputValue('input[type="radio"][name=MPR]:checked'),
      inputValue('input[type="radio"][name=MUI]:checked'),
      inputValue('input[type="radio"][name=MS]:checked'),
      inputValue('input[type="radio"][name=MC]:checked'),
      inputValue('input[type="radio"][name=MI]:checked'),
      inputValue('input[type="radio"][name=MA]:checked'));
  if (result.success === true) { 
      var L = document.querySelectorAll(".needBaseMetrics"), i = L.length; while (i--) { hide(L[i]) } parentNode(text("#baseMetricScore", result.baseMetricScore), ".scoreRating").className = "scoreRating " + result.baseSeverity.toLowerCase(); 
      text("#baseSeverity", "(" + result.baseSeverity + ")"); 
      parentNode(text("#temporalMetricScore", result.temporalMetricScore), ".scoreRating").className = "scoreRating " + result.temporalSeverity.toLowerCase(); 
      text("#temporalSeverity", "(" + result.temporalSeverity + ")"); 
      parentNode(text("#environmentalMetricScore", result.environmentalMetricScore), ".scoreRating").className = "scoreRating " + result.environmentalSeverity.toLowerCase(); 
      text("#environmentalSeverity", "(" + result.environmentalSeverity + ")"); 
      show(inputValue("#vectorString", result.vectorString)); 
      //window.location.hash = result.vectorString 
  } else { 
      if (result.error === "Not all base metrics were given - cannot calculate scores.") { 
          var L = document.querySelectorAll(".needBaseMetrics"), i = L.length; 
          while (i--) { show(L[i]) } 
          hide("#vectorString") 
      } 
  } 
}

function delayedUpdateScores() { setTimeout(updateScores, 100) }

window.Element && function (ElementPrototype) { ElementPrototype.matchesSelector = ElementPrototype.matchesSelector || ElementPrototype.mozMatchesSelector || ElementPrototype.msMatchesSelector || ElementPrototype.oMatchesSelector || ElementPrototype.webkitMatchesSelector || function (selector) { 
      var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
      while (nodes[++i] && nodes[i] != node) { } 
      return !!nodes[i] 
  } 
} (Element.prototype);

var matchesSelector = function (node, selector) {
  if (!("parentNode" in node) || !node.parentNode) {
      return false
  }
  return Array.prototype.indexOf.call(node.parentNode.querySelectorAll(selector)) != -1
};
function node() {
  for (var i = 0; i < arguments.length; i++) {
      var o = arguments[i];
      if (typeof (o) == "string" && o) {
          return document.querySelector(o);
      } else {
          if ("nodeName" in o) { return o; }
          else {
              if ("jquery" in o) { return o.get(0); }
          }
      }
  }
  return false;
}
function parentNode(p, q) {
  if (!p || !(p = node(p))) { return }
  else {
      if ((typeof (q) == "string" && p.matchesSelector(q)) || p == q) { return p }
      else {
          if (p.nodeName.toLowerCase() != "html") {
              return parentNode(p.parentNode, q);
          } else { return; }
      }
  }
}
function bind(q, tg, fn) {
  var o = node(q);
  if (!o) { return }
  if (o.addEventListener) { o.addEventListener(tg, fn, false) }
  else {
      if (o.attachEvent) { o.attachEvent("on" + tg, fn) }
      else { o["on" + tg] = fn }
  }
  return o
}
function text(q, s) {
  var e = node(q);
  if (!e) { return }
  if (arguments.length > 1) {
      if ("textContent" in e) { e.textContent = s }
      else { e.innerText = s }
      return e
  }
  return e.textContent || e.innerText
}
function hide(q) {
  var e = node(q);
  if (!e) { return }
  e.setAttribute("style", "display:none");
  return e
}
function show(q) {
  var e = node(q);
  if (!e) { return }
  e.setAttribute("style", "display:inline-block");
  return e
}
function inputValue(q, v) {
  var e = document.querySelector(q);
  if (!e || e.nodeName.toLowerCase() != "input") { return }
  if (arguments.length > 1) { e.value = v; return e }
  return e.value
}

function setMetricsFromVector(vectorString) {
  var result = true;
  var urlMetric;
  var metricValuesToSet = { AV: undefined, AC: undefined, PR: undefined, UI: undefined, S: undefined, C: undefined, I: undefined, A: undefined, E: "X", RL: "X", RC: "X", CR: "X", IR: "X", AR: "X", MAV: "X", MAC: "X", MPR: "X", MUI: "X", MS: "X", MC: "X", MI: "X", MA: "X" };
  var vectorStringRegex_30 = /^CVSS:3.1\/((AV:[NALP]|AC:[LH]|PR:[UNLH]|UI:[NR]|S:[UC]|[CIA]:[NLH]|E:[XUPFH]|RL:[XOTWU]|RC:[XURC]|[CIA]R:[XLMH]|MAV:[XNALP]|MAC:[XLH]|MPR:[XUNLH]|MUI:[XNR]|MS:[XUC]|M[CIA]:[XNLH])\/)*(AV:[NALP]|AC:[LH]|PR:[UNLH]|UI:[NR]|S:[UC]|[CIA]:[NLH]|E:[XUPFH]|RL:[XOTWU]|RC:[XURC]|[CIA]R:[XLMH]|MAV:[XNALP]|MAC:[XLH]|MPR:[XUNLH]|MUI:[XNR]|MS:[XUC]|M[CIA]:[XNLH])$/;
  if (vectorStringRegex_30.test(vectorString)) {
      var urlMetrics = vectorString.substring("CVSS:3.1/".length).split("/");
      for (var p in urlMetrics) {
          var urlMetric = urlMetrics[p].split(":");
          metricValuesToSet[urlMetric[0]] = urlMetric[1]
      } if (metricValuesToSet.AV !== undefined && metricValuesToSet.AC !== undefined && metricValuesToSet.PR !== undefined && metricValuesToSet.UI !== undefined && metricValuesToSet.S !== undefined && metricValuesToSet.C !== undefined && metricValuesToSet.I !== undefined && metricValuesToSet.A !== undefined) {
          for (var p in metricValuesToSet) { document.getElementById(p + "_" + metricValuesToSet[p]).checked = true }
      } else {
          result = "NotAllBaseMetricsProvided"
      }
  } else { result = "MalformedVectorString" } updateScores();
  return result;
}
var CVSSVectorInURL;
function urlhash() {
  var h = window.location.hash;
  CVSSVectorInURL = h;
  setMetricsFromVector(h.substring(1))
}
function inputSelect() {
  this.setSelectionRange(0, this.value.length)
}
function cvssCalculator() {
  if (!("CVSS" in window) || !("CVSS_Help" in window)) {
      setTimeout(cvssCalculator, 100);
      return
  }
  var L, i, n;
  L = document.querySelectorAll(".cvss-calculator input");
  i = L.length;
  while (i--) {
      bind(L[i], "click", delayedUpdateScores);
  }
  for (n in CVSS_Help.helpText_en) {
      document.getElementById(n).setAttribute("title", CVSS_Help.helpText_en[n])
  } urlhash();
  if (("onhashchange" in window)) {
      window.onhashchange = urlhash;
  }
  bind(bind("#vectorString", "click", inputSelect), "contextmenu", inputSelect)
}
cvssCalculator();
