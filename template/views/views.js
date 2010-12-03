iQ.include('views/components.js');

Layouts.main = {
  name: 'main'
, type: 'tabs'
, tabs: [

  /***************************************************************************
  * Configuration of the first tab – Home page
  */
    { name: 'track'
    , config: {
        title: '%tabTrack'
      , icon: '%tabTrack'
      }
    , window: {
        config: {
          title: '%winTrack'
        , barColor: Design.barColor
        }
      , components: [  ]
      }
    } /*****/
    
  /***************************************************************************
  * Configuration of the second tab – Search page
  */
  , { name: 'contacts'
    , config: {
        title: '%tabContacts'
      , icon: '%tabContacts'
      }
    , window: {
        config: {
          title: '%winContacts'
        , barColor: Design.barColor
        }
      , components: [ ]
      }
    } /*****/

  /***************************************************************************
  * Configuration of the third tab – Locations page
  */
  , { name: 'locations'
    , config: {
        title: '%tabLocations'
      , icon: '%tabLocations'
      }
    , window: {
        config: {
          title: '%winLocations'
        , barColor: Design.barColor
        }
      , components: [ ]
      }
    } /*****/


  /***************************************************************************
  * Configuration of the fifth tab – Info page
  */
  , { name: 'directions'
    , config: {
        title: '%tabDirections'
      , icon: '%tabDirections'
      }
    , window: {
        config: {
          title: '%winDirections'
        , barColor: Design.barColor
        }
      , components: [ ]
      }
    } /*****/


  /***************************************************************************
  * Configuration of the sixth tab – Settings page
  */
  , { name: 'settings'
    , config: {
        title: '%tabSettings'
      , icon: '%tabSettings'
      }
    , window: {
        config: {
          title: '%winSettings'
        , barColor: Design.barColor
        }
      , components: [ ]
      }
    } /*****/
  ]
};
