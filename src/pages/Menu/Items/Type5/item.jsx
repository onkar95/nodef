/* eslint-disable react/no-multi-comp */
import React from "react";
import {Lbc, Hooks} from "@lunchboxinc/lunchbox-components";
import ClampLines from "react-clamp-lines";
import LazyLoad from "react-lazy-load";
import useUserAgent from "use-user-agent";
import {Elements, Fragments, Templates, ElementsThemed, HOCs} from "components";
import {helpers, Copy, config} from "utils";
import styles from "./index.module.css";
import Diet from "../diet";

const {useWindowSize} = Hooks;

const {ThemeText, Cell, View} = ElementsThemed;

const {Condition} = Elements;
const {
  Drawer,
  Card: {CardBody},
} = Fragments;

const {withFacebookPixel} = HOCs;

const {
  Grid: {Row, Col},
} = Lbc;

const {ItemDetails} = Templates;

const ItemCard = ({
  id,
  images,
  name,
  dietaryRestrictions,
  description,
  price,
  calories,
  onClick,
  type,
}) => {
  const {device} = useUserAgent();
  const Img = (
    <div
      className={styles["item-image"]}
      style={{
        backgroundImage: `url(${
          images[0] ?? config?.images?.art_item_placeholder
        })`,
      }}
    />
  );
  return (
    <Cell
      type={type}
      render={({labelTextStyles, views}) => (
        <View
          type={views.background}
          className={styles["item-card"]}
          hoverable
          onClick={onClick}
        >
          <div className={styles["item-info"]}>
            <View type={views.secondary} className={styles["item-title"]}>
              <ThemeText type={labelTextStyles.primary}>
                <ClampLines
                  id={id}
                  buttons={false}
                  text={name}
                  lines={1}
                  ellipsis="..."
                />
              </ThemeText>
              <span>
                {config.diet_order.reduce((accu, x) => {
                  if (
                    dietaryRestrictions &&
                    dietaryRestrictions.indexOf(x) !== -1
                  ) {
                    accu.push(<Diet key={x} diet={x} />);
                  }
                  return accu;
                }, [])}
              </span>
            </View>

            <CardBody className={styles["item-description"]}>
              <ThemeText type={labelTextStyles.secondary} title={description}>
                {["mobile"].includes(device.type) ? (
                  <ClampLines
                    id={id}
                    buttons={false}
                    className={styles.description}
                    text={description}
                    lines={3}
                    ellipsis="..."
                  />
                ) : (
                  <ClampLines
                    id={id}
                    buttons={false}
                    className={styles.description}
                    text={description}
                    lines={3}
                    ellipsis="..."
                  />
                )}
              </ThemeText>
              <Row className={styles.stats} flex gutter={15}>
                <Col xs="1" sm="1-2">
                  <Condition is={price}>
                    <ThemeText type={labelTextStyles.tertiary}>
                      {price}
                    </ThemeText>
                  </Condition>
                </Col>
                <Col xs="1" sm="1-2" className={styles["item-cals"]}>
                  <Condition is={calories}>
                    <ThemeText
                      type={labelTextStyles.tertiary}
                    >{`${calories} cal`}</ThemeText>
                  </Condition>
                </Col>
              </Row>
            </CardBody>
          </div>

          <div className={styles["item-image-container"]}>
            {device.type === "mobile" ? (
              <LazyLoad offset={250} height="100%" once>
                {Img}
              </LazyLoad>
            ) : (
              Img
            )}
          </div>
        </View>
      )}
    />
  );
};

const Item = React.memo(
  ({
    id,
    images,
    name,
    dietaryRestrictions,
    description,
    price,
    calories,
    type,
    isViewOnly,
    isGroup = false,
    tracker,
    ...props
  }) => {
    const {width} = useWindowSize({debounce: 300});
    const [drawerWidth, setWidth] = React.useState();

    const newWidth = (breakPoint) => {
      switch (breakPoint) {
        case "sm":
          setWidth("80vw");
          break;
        case "md":
          setWidth("50vw");
          break;
        case "lg":
        case "xl":
        case "xxl":
          setWidth("40vw");
          break;
        default:
          setWidth("100vw");
      }
    };

    const {name: breakPoint} = helpers.determineBreakPoint(width);

    React.useEffect(() => {
      newWidth(breakPoint);
    }, [breakPoint]);

    return (
      <Drawer.ResponsiveDrawer
        trigger={
          <ItemCard
            id={id}
            type={breakPoint === "xs" ? type.mobile : type.desktop}
            images={images}
            name={name}
            dietaryRestrictions={dietaryRestrictions}
            description={description}
            price={price}
            calories={calories}
          />
        }
        drawerProps={{
          destroyOnClose: true,
          onChange: (isOpen) => {
            if (isOpen) {
              tracker({
                content_category: id,
                content_name: name,
                content_type: isGroup ? "Subgroup" : "Item",
              });
            }
          },
          width: drawerWidth,
        }}
      >
        {(drawerProps) => (
          <ItemDetails
            isGroup={isGroup}
            id={id}
            isViewOnly={isViewOnly}
            showClose
            onConfirm={props.onAdd}
            close={() => drawerProps.close()}
            buttonText={Copy.MENU_STATIC.ADD_TO_CART_BUTTON_TEXT}
          />
        )}
      </Drawer.ResponsiveDrawer>
    );
  },
);

export default withFacebookPixel(Item, "ViewContent");
